#!/usr/bin/env swift

import AppKit
import CryptoKit
import Foundation
import ImageIO

private let magic = Array("KMGASSET".utf8)
private let formatVersion: UInt8 = 1
private let algorithmAESGCM256: UInt8 = 1

private struct Arguments {
    var input: URL?
    var output: URL?
    var logicalRoot = "BKThemes"
    var force = false
}

private struct ManifestEntry: Codable {
    let logicalName: String
    let encryptedPath: String
    let originalExtension: String
    let sha256Plaintext: String
    let sha256CipherFile: String
    let width: Int?
    let height: Int?
    let generatedAt: String
    let formatVersion: Int
}

private struct Manifest: Codable {
    let generatedAt: String
    let formatVersion: Int
    let algorithm: String
    let entries: [ManifestEntry]
}

private enum ToolError: Error, CustomStringConvertible {
    case missingArgument(String)
    case invalidHexKey
    case unsupportedFile(URL)

    var description: String {
        switch self {
        case .missingArgument(let name):
            return "missing required argument: \(name)"
        case .invalidHexKey:
            return "KMG_ART_ASSET_KEY_HEX must be 64 hex characters when provided"
        case .unsupportedFile(let url):
            return "unsupported file: \(url.path)"
        }
    }
}

private func parseArguments() throws -> Arguments {
    var result = Arguments()
    var iterator = CommandLine.arguments.dropFirst().makeIterator()
    while let arg = iterator.next() {
        switch arg {
        case "--input":
            guard let value = iterator.next() else { throw ToolError.missingArgument("--input") }
            result.input = URL(fileURLWithPath: value)
        case "--output":
            guard let value = iterator.next() else { throw ToolError.missingArgument("--output") }
            result.output = URL(fileURLWithPath: value)
        case "--logical-root":
            guard let value = iterator.next() else { throw ToolError.missingArgument("--logical-root") }
            result.logicalRoot = value.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
        case "--force":
            result.force = true
        default:
            throw ToolError.missingArgument("unknown argument \(arg)")
        }
    }
    return result
}

private func embeddedKeyMaterial() -> SymmetricKey {
    let a: [UInt8] = [0x38, 0xa5, 0x4c, 0x13, 0x77, 0xd1, 0x90, 0x2e]
    let b: [UInt8] = [0xc6, 0x0b, 0xf2, 0x44, 0x9d, 0x21, 0x6a, 0xbc]
    let c: [UInt8] = [0x05, 0xe9, 0x73, 0x8f, 0x12, 0x56, 0xd8, 0x3a]
    let d: [UInt8] = [0xb1, 0x64, 0x2f, 0xce, 0x49, 0x80, 0x0d, 0xf7]
    var material: [UInt8] = []
    for (index, byte) in (a + c + b + d).enumerated() {
        material.append(byte ^ UInt8((index &* 29 + 0x5d) & 0xff))
    }
    let digest = SHA256.hash(data: Data(material + Array("kmgccc-player-art-assets-v1".utf8)))
    return SymmetricKey(data: Data(digest))
}

private func keyFromEnvironment() throws -> SymmetricKey? {
    guard let hex = ProcessInfo.processInfo.environment["KMG_ART_ASSET_KEY_HEX"], !hex.isEmpty else {
        return nil
    }
    guard hex.count == 64 else { throw ToolError.invalidHexKey }

    var bytes: [UInt8] = []
    bytes.reserveCapacity(32)
    var index = hex.startIndex
    while index < hex.endIndex {
        let next = hex.index(index, offsetBy: 2)
        guard let byte = UInt8(hex[index..<next], radix: 16) else {
            throw ToolError.invalidHexKey
        }
        bytes.append(byte)
        index = next
    }
    return SymmetricKey(data: Data(bytes))
}

private func appendUInt16(_ value: UInt16, to data: inout Data) {
    var bigEndian = value.bigEndian
    withUnsafeBytes(of: &bigEndian) { data.append(contentsOf: $0) }
}

private func appendUInt64(_ value: UInt64, to data: inout Data) {
    var bigEndian = value.bigEndian
    withUnsafeBytes(of: &bigEndian) { data.append(contentsOf: $0) }
}

private func sha256Hex(_ data: Data) -> String {
    SHA256.hash(data: data).map { String(format: "%02x", $0) }.joined()
}

private func imageDimensions(for url: URL) -> (Int?, Int?) {
    guard let source = CGImageSourceCreateWithURL(url as CFURL, nil),
          let properties = CGImageSourceCopyPropertiesAtIndex(source, 0, nil) as? [CFString: Any]
    else {
        return (nil, nil)
    }
    return (
        properties[kCGImagePropertyPixelWidth] as? Int,
        properties[kCGImagePropertyPixelHeight] as? Int
    )
}

private func encrypt(_ plaintext: Data, key: SymmetricKey) throws -> Data {
    let sealed = try AES.GCM.seal(plaintext, using: key)
    var output = Data()
    output.append(contentsOf: magic)
    output.append(formatVersion)
    output.append(algorithmAESGCM256)
    output.append(0)
    appendUInt16(UInt16(sealed.nonce.withUnsafeBytes { $0.count }), to: &output)
    appendUInt16(UInt16(sealed.tag.count), to: &output)
    appendUInt64(UInt64(sealed.ciphertext.count), to: &output)
    sealed.nonce.withUnsafeBytes { output.append(contentsOf: $0) }
    output.append(sealed.ciphertext)
    output.append(sealed.tag)
    return output
}

private func loadExistingManifest(from url: URL) -> [String: ManifestEntry] {
    guard let data = try? Data(contentsOf: url),
          let manifest = try? JSONDecoder().decode(Manifest.self, from: data)
    else {
        return [:]
    }
    return Dictionary(uniqueKeysWithValues: manifest.entries.map { ($0.logicalName, $0) })
}

private func pngFiles(in input: URL) throws -> [URL] {
    guard let enumerator = FileManager.default.enumerator(
        at: input,
        includingPropertiesForKeys: [.isRegularFileKey],
        options: [.skipsHiddenFiles]
    ) else {
        return []
    }
    return try enumerator.compactMap { item in
        guard let url = item as? URL else { return nil }
        let values = try url.resourceValues(forKeys: [.isRegularFileKey])
        guard values.isRegularFile == true else { return nil }
        guard url.pathExtension.lowercased() == "png" else { return nil }
        return url
    }.sorted { $0.path < $1.path }
}

private func relativePath(from file: URL, root: URL) -> String {
    let rootPath = root.standardizedFileURL.path
    let filePath = file.standardizedFileURL.path
    var relative = String(filePath.dropFirst(rootPath.count))
    if relative.hasPrefix("/") { relative.removeFirst() }
    return relative
}

private func run() throws {
    let args = try parseArguments()
    guard let input = args.input else { throw ToolError.missingArgument("--input") }
    guard let output = args.output else { throw ToolError.missingArgument("--output") }

    let key = try keyFromEnvironment() ?? embeddedKeyMaterial()
    let generatedAt = ISO8601DateFormatter().string(from: Date())
    let manifestURL = output.appendingPathComponent("manifest.json")
    let existing = loadExistingManifest(from: manifestURL)
    let inputRoot = input.standardizedFileURL

    var encrypted = 0
    var skipped = 0
    var failed = 0
    var entries: [ManifestEntry] = []

    try FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)

    for file in try pngFiles(in: inputRoot) {
        do {
            let originalData = try Data(contentsOf: file)
            let plaintextHash = sha256Hex(originalData)
            let relative = relativePath(from: file, root: inputRoot)
            guard !relative.isEmpty else { throw ToolError.unsupportedFile(file) }

            let stem = (relative as NSString).deletingPathExtension
            let logicalName = "\(args.logicalRoot)/\(stem)"
            let encryptedRelative = "\(args.logicalRoot)/\(stem).kmgasset"
            let encryptedURL = output.appendingPathComponent(encryptedRelative)
            let previous = existing[logicalName]

            if !args.force,
               let previous,
               previous.sha256Plaintext == plaintextHash,
               FileManager.default.fileExists(atPath: encryptedURL.path)
            {
                skipped += 1
                entries.append(previous)
                continue
            }

            try FileManager.default.createDirectory(
                at: encryptedURL.deletingLastPathComponent(),
                withIntermediateDirectories: true
            )
            let cipherFile = try encrypt(originalData, key: key)
            try cipherFile.write(to: encryptedURL, options: [.atomic])
            let dimensions = imageDimensions(for: file)
            entries.append(
                ManifestEntry(
                    logicalName: logicalName,
                    encryptedPath: encryptedRelative,
                    originalExtension: file.pathExtension.lowercased(),
                    sha256Plaintext: plaintextHash,
                    sha256CipherFile: sha256Hex(cipherFile),
                    width: dimensions.0,
                    height: dimensions.1,
                    generatedAt: generatedAt,
                    formatVersion: Int(formatVersion)
                )
            )
            encrypted += 1
        } catch {
            failed += 1
            fputs("error: \(file.path): \(error)\n", stderr)
        }
    }

    let manifest = Manifest(
        generatedAt: generatedAt,
        formatVersion: Int(formatVersion),
        algorithm: "AES.GCM.256",
        entries: entries.sorted { $0.logicalName < $1.logicalName }
    )
    let encoder = JSONEncoder()
    encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
    try encoder.encode(manifest).write(to: manifestURL, options: [.atomic])

    print("Encrypted: \(encrypted)")
    print("Skipped: \(skipped)")
    print("Failed: \(failed)")
    print("Output: \(output.path)")

    if failed > 0 {
        exit(1)
    }
}

do {
    try run()
} catch {
    fputs("error: \(error)\n", stderr)
    exit(2)
}
