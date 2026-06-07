import React from 'react'

type LiquidGlassFilterProps = {
  id: string
  width: number
  height: number
  radius: number
  blur: number
  bezelWidth: number
  glassThickness: number
  refractiveIndex: number
  scaleRatio: number
  specularOpacity: number
  specularSaturation: number
  specularWidth?: number
  includeSpecular?: boolean
  dpr?: number
}

type LiquidGlassFilterData = {
  displacementUrl: string
  specularUrl: string
  displacementScale: number
}

const liquidGlassFilterDataCache = new Map<string, LiquidGlassFilterData>()

const convexSquircle = (value: number): number => Math.pow(1 - Math.pow(1 - value, 4), 1 / 4)

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function imageDataToUrl(imageData: ImageData): string {
  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas unavailable for Liquid Glass filter')
  }

  context.putImageData(imageData, 0, 0)
  return canvas.toDataURL()
}

function computeRefractionProfile(
  glassThickness: number,
  bezelWidth: number,
  refractiveIndex: number,
  samples = 160
): number[] {
  const inverseIndex = 1 / refractiveIndex

  function refract(normalX: number, normalY: number): [number, number] | null {
    const discriminant = 1 - inverseIndex * inverseIndex * (1 - normalY * normalY)
    if (discriminant < 0) return null
    const root = Math.sqrt(discriminant)
    return [
      -(inverseIndex * normalY + root) * normalX,
      inverseIndex - (inverseIndex * normalY + root) * normalY
    ]
  }

  return Array.from({ length: samples }, (_entry, index) => {
    const t = index / samples
    const curve = convexSquircle(t)
    const delta = 0.0001
    const derivative = (convexSquircle(t + delta) - curve) / delta
    const normalLength = Math.sqrt(derivative * derivative + 1)
    const ray = refract(-derivative / normalLength, -1 / normalLength)

    if (!ray || Math.abs(ray[1]) < 0.0001) return 0
    return ray[0] * ((curve * bezelWidth + glassThickness) / ray[1])
  })
}

function createDisplacementMap({
  width,
  height,
  radius,
  bezelWidth,
  maxDisplacement,
  profile,
  dpr
}: {
  width: number
  height: number
  radius: number
  bezelWidth: number
  maxDisplacement: number
  profile: number[]
  dpr: number
}): ImageData {
  const imageWidth = Math.round(width * dpr)
  const imageHeight = Math.round(height * dpr)
  const imageData = new ImageData(imageWidth, imageHeight)

  new Uint32Array(imageData.data.buffer).fill(0xff008080)

  const outerRadius = Math.round(radius * dpr)
  const bezel = Math.round(bezelWidth * dpr)
  const outerRadiusSq = outerRadius ** 2
  const outerFeatherSq = (outerRadius + 1) ** 2
  const innerRadiusSq = Math.max(0, outerRadius - bezel) ** 2
  const contentWidth = imageWidth - outerRadius * 2
  const contentHeight = imageHeight - outerRadius * 2

  for (let y = 0; y < imageHeight; y += 1) {
    for (let x = 0; x < imageWidth; x += 1) {
      const edgeX = x < outerRadius ? x - outerRadius : x >= imageWidth - outerRadius ? x - outerRadius - contentWidth : 0
      const edgeY =
        y < outerRadius ? y - outerRadius : y >= imageHeight - outerRadius ? y - outerRadius - contentHeight : 0
      const distanceSq = edgeX * edgeX + edgeY * edgeY

      if (distanceSq > outerFeatherSq || distanceSq < innerRadiusSq) continue

      const distance = Math.max(0.0001, Math.sqrt(distanceSq))
      const feather =
        distanceSq < outerRadiusSq
          ? 1
          : 1 -
            (distance - Math.sqrt(outerRadiusSq)) /
              (Math.sqrt(outerFeatherSq) - Math.sqrt(outerRadiusSq))
      const depth = outerRadius - distance
      const profileIndex = clamp(Math.floor((depth / Math.max(1, bezel)) * profile.length), 0, profile.length - 1)
      const refraction = profile[profileIndex] ?? 0
      const dx = -(edgeX / distance) * (refraction / Math.max(1, maxDisplacement))
      const dy = -(edgeY / distance) * (refraction / Math.max(1, maxDisplacement))
      const dataIndex = (y * imageWidth + x) * 4

      imageData.data[dataIndex] = clamp(128 + dx * 127 * feather, 0, 255)
      imageData.data[dataIndex + 1] = clamp(128 + dy * 127 * feather, 0, 255)
      imageData.data[dataIndex + 2] = 0
      imageData.data[dataIndex + 3] = 255
    }
  }

  return imageData
}

function createSpecularMap({
  width,
  height,
  radius,
  specularWidth,
  dpr
}: {
  width: number
  height: number
  radius: number
  specularWidth: number
  dpr: number
}): ImageData {
  const imageWidth = Math.round(width * dpr)
  const imageHeight = Math.round(height * dpr)
  const imageData = new ImageData(imageWidth, imageHeight)
  const outerRadius = Math.round(radius * dpr)
  const highlightWidth = Math.round(specularWidth * dpr)
  const light = [Math.cos(Math.PI / 3), Math.sin(Math.PI / 3)]
  const outerRadiusSq = outerRadius ** 2
  const outerFeatherSq = (outerRadius + dpr) ** 2
  const innerRadiusSq = Math.max(0, outerRadius - highlightWidth) ** 2
  const contentWidth = imageWidth - outerRadius * 2
  const contentHeight = imageHeight - outerRadius * 2

  new Uint32Array(imageData.data.buffer).fill(0)

  for (let y = 0; y < imageHeight; y += 1) {
    for (let x = 0; x < imageWidth; x += 1) {
      const edgeX = x < outerRadius ? x - outerRadius : x >= imageWidth - outerRadius ? x - outerRadius - contentWidth : 0
      const edgeY =
        y < outerRadius ? y - outerRadius : y >= imageHeight - outerRadius ? y - outerRadius - contentHeight : 0
      const distanceSq = edgeX * edgeX + edgeY * edgeY

      if (distanceSq > outerFeatherSq || distanceSq < innerRadiusSq) continue

      const distance = Math.max(0.0001, Math.sqrt(distanceSq))
      const depth = outerRadius - distance
      const feather =
        distanceSq < outerRadiusSq
          ? 1
          : 1 -
            (distance - Math.sqrt(outerRadiusSq)) /
              (Math.sqrt(outerFeatherSq) - Math.sqrt(outerRadiusSq))
      const normalX = edgeX / distance
      const normalY = -edgeY / distance
      const intensity =
        Math.abs(normalX * light[0] + normalY * light[1]) *
        Math.sqrt(Math.max(0, 1 - (1 - depth / Math.max(1, dpr)) ** 2))
      const rgb = clamp(255 * intensity, 0, 255)
      const alpha = clamp(rgb * intensity * feather, 0, 255)
      const dataIndex = (y * imageWidth + x) * 4

      imageData.data[dataIndex] = rgb
      imageData.data[dataIndex + 1] = rgb
      imageData.data[dataIndex + 2] = rgb
      imageData.data[dataIndex + 3] = alpha
    }
  }

  return imageData
}

function filterDataCacheKey({
  width,
  height,
  radius,
  bezelWidth,
  glassThickness,
  refractiveIndex,
  scaleRatio,
  specularWidth = 44,
  dpr = 1
}: LiquidGlassFilterProps): string {
  return [
    width,
    height,
    radius,
    bezelWidth,
    glassThickness,
    refractiveIndex,
    scaleRatio,
    specularWidth,
    dpr
  ].join('|')
}

function getOrCreateFilterData(props: LiquidGlassFilterProps): LiquidGlassFilterData | null {
  if (typeof document === 'undefined') return null

  const key = filterDataCacheKey(props)
  const cached = liquidGlassFilterDataCache.get(key)
  if (cached) return cached

  const {
    width,
    height,
    radius,
    bezelWidth,
    glassThickness,
    refractiveIndex,
    scaleRatio,
    specularWidth = 44,
    dpr = 1
  } = props
  const profile = computeRefractionProfile(glassThickness, bezelWidth, refractiveIndex)
  const maxDisplacement = Math.max(...profile.map((value) => Math.abs(value)), 1)
  const displacementMap = createDisplacementMap({
    width,
    height,
    radius,
    bezelWidth,
    maxDisplacement,
    profile,
    dpr
  })
  const specularMap = createSpecularMap({
    width,
    height,
    radius,
    specularWidth,
    dpr
  })
  const filterData = {
    displacementUrl: imageDataToUrl(displacementMap),
    specularUrl: imageDataToUrl(specularMap),
    displacementScale: maxDisplacement * scaleRatio
  }

  liquidGlassFilterDataCache.set(key, filterData)
  return filterData
}

const LiquidGlassFilter = React.memo(function LiquidGlassFilter({
  id,
  width,
  height,
  radius,
  blur,
  bezelWidth,
  glassThickness,
  refractiveIndex,
  scaleRatio,
  specularOpacity,
  specularSaturation,
  specularWidth = 44,
  includeSpecular = true,
  dpr = 1
}: LiquidGlassFilterProps): React.ReactElement | null {
  const filterData = React.useMemo(
    () =>
      getOrCreateFilterData({
        id,
        width,
        height,
        radius,
        blur,
        bezelWidth,
        glassThickness,
        refractiveIndex,
        scaleRatio,
        specularOpacity,
        specularSaturation,
        specularWidth,
        includeSpecular,
        dpr
      }),
    [
      bezelWidth,
      blur,
      dpr,
      glassThickness,
      height,
      includeSpecular,
      id,
      radius,
      refractiveIndex,
      scaleRatio,
      specularOpacity,
      specularSaturation,
      specularWidth,
      width
    ]
  )

  if (!filterData) return null

  return (
    <svg className="liquid-glass-def" aria-hidden="true" focusable="false">
      <defs>
        <filter
          id={id}
          colorInterpolationFilters="sRGB"
          x="-16%"
          y="-16%"
          width="132%"
          height="132%"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blurred_source" />
          <feImage
            href={filterData.displacementUrl}
            x="0"
            y="0"
            width={width}
            height={height}
            preserveAspectRatio="none"
            result="displacement_map"
          />
          <feDisplacementMap
            in="blurred_source"
            in2="displacement_map"
            scale={filterData.displacementScale}
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          {includeSpecular ? (
            <>
              <feColorMatrix in="displaced" type="saturate" values={specularSaturation.toString()} result="saturated" />
              <feImage
                href={filterData.specularUrl}
                x="0"
                y="0"
                width={width}
                height={height}
                preserveAspectRatio="none"
                result="specular_layer"
              />
              <feComposite in="saturated" in2="specular_layer" operator="in" result="specular_saturated" />
              <feComponentTransfer in="specular_layer" result="specular_faded">
                <feFuncA type="linear" slope={specularOpacity.toString()} />
              </feComponentTransfer>
              <feBlend in="specular_saturated" in2="displaced" mode="normal" result="with_saturation" />
              <feBlend in="specular_faded" in2="with_saturation" mode="normal" />
            </>
          ) : (
            <feBlend in="displaced" in2="displaced" mode="normal" />
          )}
        </filter>
      </defs>
    </svg>
  )
})

function HomeLiquidGlassFilter(): React.ReactElement {
  return (
    <svg className="liquid-glass-def" aria-hidden="true" focusable="false">
      <defs>
        <filter id="lg-home-liquid" colorInterpolationFilters="sRGB" x="-18%" y="-18%" width="136%" height="136%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="home_blur" />
          <feColorMatrix in="home_blur" type="saturate" values="1.75" result="home_saturated" />
          <feComponentTransfer in="home_saturated">
            <feFuncA type="linear" slope="1" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  )
}

export const LiquidGlassFilters = React.memo(function LiquidGlassFilters(): React.ReactElement {
  return (
    <div className="liquid-glass-bank" aria-hidden="true">
      <HomeLiquidGlassFilter />
      <LiquidGlassFilter
        id="lg-sidebar"
        width={272}
        height={960}
        radius={28}
        blur={2.4}
        bezelWidth={24}
        glassThickness={120}
        refractiveIndex={1.34}
        scaleRatio={1.18}
        specularOpacity={0.82}
        specularSaturation={8}
        specularWidth={56}
        includeSpecular={false}
        dpr={0.5}
      />
      <LiquidGlassFilter
        id="lg-mini"
        width={1800}
        height={58}
        radius={29}
        blur={3.3}
        bezelWidth={25}
        glassThickness={92}
        refractiveIndex={1.3}
        scaleRatio={1}
        specularOpacity={1}
        specularSaturation={25}
        specularWidth={42}
        dpr={1.15}
      />
      <LiquidGlassFilter
        id="lg-toolbar-pill"
        width={130}
        height={40}
        radius={20}
        blur={1.4}
        bezelWidth={18}
        glassThickness={96}
        refractiveIndex={1.32}
        scaleRatio={1}
        specularOpacity={0.9}
        specularSaturation={12}
        specularWidth={24}
        dpr={1.25}
      />
      <LiquidGlassFilter
        id="lg-search"
        width={292}
        height={40}
        radius={20}
        blur={2.2}
        bezelWidth={18}
        glassThickness={100}
        refractiveIndex={1.3}
        scaleRatio={1}
        specularOpacity={0.95}
        specularSaturation={18}
        specularWidth={26}
        dpr={1.25}
      />
      <LiquidGlassFilter
        id="lg-circle"
        width={42}
        height={42}
        radius={21}
        blur={1.1}
        bezelWidth={15}
        glassThickness={96}
        refractiveIndex={1.35}
        scaleRatio={1.1}
        specularOpacity={0.9}
        specularSaturation={14}
        specularWidth={20}
        dpr={1.3}
      />
    </div>
  )
})
