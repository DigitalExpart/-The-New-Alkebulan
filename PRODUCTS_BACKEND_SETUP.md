# Products Backend Setup Guide

This guide will help you set up a complete products backend system in Supabase for your marketplace application.

## 🚀 Quick Start

### 1. Run the Main Setup Script
Execute the main SQL script in your Supabase SQL editor:
```sql
-- Copy and paste the contents of scripts/create-products-backend.sql
```

### 2. Create Storage Buckets
In your Supabase dashboard, go to **Storage** and create two buckets:

#### Product Images Bucket
- **Bucket ID**: `product-images`
- **Name**: Product Images
- **Public**: ✅ Yes (for public viewing)
- **File size limit**: 10MB
- **Allowed MIME types**: `image/*`

#### Product Videos Bucket
- **Bucket ID**: `product-videos`
- **Name**: Product Videos
- **Public**: ✅ Yes (for public viewing)
- **File size limit**: 100MB
- **Allowed MIME types**: `video/*`

### 3. Run the Storage Setup Script
Execute the storage SQL script:
```sql
-- Copy and paste the contents of scripts/setup-product-storage.sql
```

## 🗄️ Database Schema Overview

### Core Tables

#### 1. **products** - Main product information
- `id`: Unique product identifier
- `user_id`: Product owner (seller)
- `name`: Product name
- `sku`: Stock keeping unit (optional)
- `category`: Main category (physical/digital)
- `subcategory`: Specific product type
- `actual_price`: Original price
- `sales_price`: Discounted price
- `description`: Product description
- `additional_description`: Extra details
- `status`: Draft/Active/Inactive
- `inventory`: Available quantity
- `has_variants`: Whether product has variants

#### 2. **product_variants** - Product variations
- `product_id`: Reference to product
- `variant_type`: Color, size, number, weight
- `variant_value`: Specific variant value

#### 3. **product_images** - Product photos
- `product_id`: Reference to product
- `image_url`: Storage URL
- `image_name`: Original filename
- `image_size`: File size in bytes
- `image_type`: MIME type
- `is_primary`: Main product image
- `sort_order`: Display order

#### 4. **product_videos** - Product videos
- `product_id`: Reference to product
- `video_url`: Storage URL
- `video_name`: Original filename
- `video_size`: File size in bytes
- `video_type`: MIME type
- `duration`: Video length in seconds
- `sort_order`: Display order

#### 5. **product_inventory** - Stock management
- `product_id`: Reference to product
- `variant_combination`: JSON of variant values
- `quantity`: Available stock
- `reserved_quantity`: Items in cart/checkout
- `low_stock_threshold`: Alert threshold

#### 6. **product_reviews** - Customer feedback
- `product_id`: Reference to product
- `user_id`: Reviewer
- `rating`: 1-5 star rating
- `title`: Review title
- `comment`: Review text
- `is_verified_purchase`: Purchase verification

#### 7. **product_favorites** - User wishlists
- `product_id`: Reference to product
- `user_id`: User who favorited
- `created_at`: When favorited

#### 8. **product_views** - Analytics tracking
- `product_id`: Reference to product
- `user_id`: Viewer (can be null for anonymous)
- `ip_address`: Viewer IP
- `user_agent`: Browser info
- `viewed_at`: View timestamp

### Reference Tables

#### 9. **product_categories** - Main categories
- `name`: Category name
- `type`: Physical or Digital
- `description`: Category description

#### 10. **product_subcategories** - Specific types
- `category_id`: Reference to main category
- `name`: Subcategory name
- `description`: Subcategory description

## 🔐 Security & Permissions

### Row Level Security (RLS)
All tables have RLS enabled with appropriate policies:

#### Product Access
- **Public**: Can view active products and their media
- **Owners**: Can manage their own products (CRUD operations)
- **Authenticated**: Can create reviews, favorites, and view analytics

#### Media Access
- **Public**: Can view images/videos of active products
- **Owners**: Can upload, update, and delete their product media
- **Validation**: File type and size restrictions enforced

### Storage Policies
- **Images**: 10MB limit, image types only
- **Videos**: 100MB limit, video types only
- **Access Control**: Public viewing, owner-only management

## 📊 Performance Features

### Indexes
- User ID lookups
- Category and status filtering
- Price range queries
- Variant combinations (GIN index)
- Media file organization
- Review ratings and dates

### Functions
- **File Validation**: Type and size checking
- **Unique Naming**: Prevents filename conflicts
- **Media Cleanup**: Removes orphaned files
- **URL Generation**: Efficient media URL retrieval

## 🛠️ API Integration

### Frontend Integration
The backend is designed to work seamlessly with the existing React frontend:

#### Product Creation Flow
1. Create product record
2. Upload media files to storage
3. Create media records with URLs
4. Add variant options
5. Set inventory levels

#### Data Retrieval
- Products with variants
- Media with proper ordering
- Inventory status
- Reviews and ratings
- Analytics data

## 🔧 Maintenance & Monitoring

### Regular Tasks
1. **Cleanup Orphaned Media**: Run `cleanup_orphaned_media()` function
2. **Monitor Storage Usage**: Check bucket sizes in dashboard
3. **Review Performance**: Monitor query performance
4. **Backup Data**: Regular database backups

### Monitoring Queries
```sql
-- Check product counts by status
SELECT status, COUNT(*) FROM products GROUP BY status;

-- Monitor storage usage
SELECT bucket_id, COUNT(*), SUM(metadata->>'size')::bigint as total_size
FROM storage.objects 
GROUP BY bucket_id;

-- Check for orphaned media
SELECT COUNT(*) as orphaned_images
FROM storage.objects 
WHERE bucket_id = 'product-images' 
AND NOT EXISTS (
  SELECT 1 FROM product_images pi
  WHERE pi.image_url LIKE '%' || storage.objects.name || '%'
);
```

## 🚨 Troubleshooting

### Common Issues

#### 1. **Storage Upload Fails**
- Check bucket permissions
- Verify file size limits
- Ensure correct MIME types
- Check RLS policies

#### 2. **Product Creation Errors**
- Verify user authentication
- Check required fields
- Ensure category/subcategory exist
- Validate variant data

#### 3. **Media Display Issues**
- Check storage bucket public access
- Verify file URLs are correct
- Ensure RLS policies allow viewing
- Check file permissions

### Debug Queries
```sql
-- Check user permissions
SELECT auth.uid(), auth.role();

-- Verify product ownership
SELECT p.*, u.email 
FROM products p 
JOIN auth.users u ON p.user_id = u.id 
WHERE p.id = 'your-product-id';

-- Check storage access
SELECT * FROM storage.objects 
WHERE bucket_id = 'product-images' 
LIMIT 5;
```

## 📈 Scaling Considerations

### Performance
- **Database**: Consider read replicas for high traffic
- **Storage**: Use CDN for global media delivery
- **Caching**: Implement Redis for frequently accessed data
- **Search**: Add full-text search capabilities

### Security
- **Rate Limiting**: Prevent abuse of upload endpoints
- **File Scanning**: Virus/malware detection for uploads
- **Access Logging**: Track all file access attempts
- **Backup Strategy**: Regular automated backups

## 🎯 Next Steps

1. **Test the Setup**: Create a test product with media
2. **Integrate Frontend**: Update the React form to use the backend
3. **Add Features**: Implement search, filtering, and pagination
4. **Monitor Usage**: Track performance and user behavior
5. **Optimize**: Fine-tune based on usage patterns

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all SQL scripts executed successfully
3. Check Supabase dashboard for errors
4. Review RLS policies and permissions
5. Test with simple queries first

---

**Note**: This backend system provides a solid foundation for a marketplace application. It's designed to be secure, scalable, and maintainable while providing all the features needed for product management.
