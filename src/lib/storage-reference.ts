export const getStoragePathFromReference = (reference: string, bucket: string): string => {
  try {
    const url = new URL(reference)
    const marker = `/storage/v1/object/sign/${bucket}/`
    const markerIndex = url.pathname.indexOf(marker)
    if (markerIndex >= 0) {
      return decodeURIComponent(url.pathname.slice(markerIndex + marker.length))
    }
  } catch {
    // The database may already contain a plain storage path.
  }

  return reference.replace(/^\/+/, "")
}
