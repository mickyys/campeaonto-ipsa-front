import { renderOgImage, alt, size, contentType } from '@/lib/og-image'

export { alt, size, contentType }

export const dynamic = 'force-static'

export default function Image() {
  return renderOgImage()
}
