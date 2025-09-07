import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const category = searchParams.get('category')
    const postTitle = searchParams.get('postTitle') === 'true'
    const comments = searchParams.get('comments') === 'true'

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: [] })
    }

    const supabase = createClient()
    let results: any[] = []

    if (category === 'all' || category === 'post') {
      // Search posts
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id, title, content, author_id, created_at, user:author_id(first_name, last_name)')
        .or(`title.ilike.%${query}%, content.ilike.%${query}%`)
        .limit(10)

      if (!postsError && posts) {
        results.push(...posts.map(post => ({
          id: post.id,
          type: 'post',
          title: post.title,
          content: post.content?.substring(0, 100) + '...',
          author: post.user ? `${post.user.first_name} ${post.user.last_name}` : 'Unknown',
          date: new Date(post.created_at).toLocaleDateString()
        })))
      }
    }

    if (category === 'all' || category === 'communities') {
      // Search communities
      const { data: communities, error: communitiesError } = await supabase
        .from('communities')
        .select('id, name, description, member_count')
        .or(`name.ilike.%${query}%, description.ilike.%${query}%`)
        .limit(10)

      if (!communitiesError && communities) {
        results.push(...communities.map(community => ({
          id: community.id,
          type: 'community',
          name: community.name,
          description: community.description?.substring(0, 100) + '...',
          members: community.member_count || 0
        })))
      }
    }

    if (category === 'all' || category === 'companies') {
      // Search companies
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id, name, description, industry')
        .or(`name.ilike.%${query}%, description.ilike.%${query}%, industry.ilike.%${query}%`)
        .limit(10)

      if (!companiesError && companies) {
        results.push(...companies.map(company => ({
          id: company.id,
          type: 'company',
          name: company.name,
          description: company.description?.substring(0, 100) + '...',
          industry: company.industry
        })))
      }
    }

    if (category === 'all' || category === 'products') {
      // Search products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, description, price')
        .or(`name.ilike.%${query}%, description.ilike.%${query}%`)
        .limit(10)

      if (!productsError && products) {
        results.push(...products.map(product => ({
          id: product.id,
          type: 'product',
          name: product.name,
          description: product.description?.substring(0, 100) + '...',
          price: product.price ? `$${product.price}` : 'Price not available'
        })))
      }
    }

    if (category === 'all' || category === 'friends') {
      // Search users/profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, title, location')
        .or(`first_name.ilike.%${query}%, last_name.ilike.%${query}%, title.ilike.%${query}%`)
        .limit(10)

      if (!profilesError && profiles) {
        results.push(...profiles.map(profile => ({
          id: profile.id,
          type: 'user',
          name: `${profile.first_name} ${profile.last_name}`,
          title: profile.title || 'No title',
          location: profile.location || 'Location not specified'
        })))
      }
    }

    if (comments && (category === 'all' || category === 'post')) {
      // Search comments
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('id, content, post_id, user_id, created_at, user:user_id(first_name, last_name), post:post_id(title)')
        .ilike('content', `%${query}%`)
        .limit(10)

      if (!commentsError && comments) {
        results.push(...comments.map(comment => ({
          id: comment.id,
          type: 'comment',
          title: `Comment on: ${comment.post?.title || 'Unknown Post'}`,
          content: comment.content?.substring(0, 100) + '...',
          author: comment.user ? `${comment.user.first_name} ${comment.user.last_name}` : 'Unknown',
          date: new Date(comment.created_at).toLocaleDateString()
        })))
      }
    }

    return NextResponse.json({ 
      results: results.slice(0, 20), // Limit total results
      query,
      category,
      total: results.length
    })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Search failed', results: [] },
      { status: 500 }
    )
  }
}
