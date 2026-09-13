import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://avixtopup.com' // সঠিক ডোমেইন সেট করা হয়েছে

  // ১. স্ট্যাটিক পেজসমূহ
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3, // লগইন পেজের প্রায়োরিটি কমানো ভালো
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // ২. ডায়নামিক প্রোডাক্ট/টপ-আপ পেজ (ডাটাবেস বা API থেকে ডায়নামিক ডাটা আনুন)
  /*
  const products = await fetchProducts() // আপনার ডাটাবেস বা API কল
  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/top-up/${product.slug}`,
    lastModified: new Date(product.updatedAt || Date.now()),
    changeFrequency: 'daily',
    priority: 0.8,
  }))
  */

  return [
    ...staticRoutes,
    // ...productRoutes // ডায়নামিক ইউআরএল থাকলে এটি আনকমেন্ট করুন
  ]
}