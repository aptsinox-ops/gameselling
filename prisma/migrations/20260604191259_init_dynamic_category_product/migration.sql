-- CreateTable: User
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0, -- ব্যালেন্স ট্র্যাক করার জন্য
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'User',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Category
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slotNo" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Product
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,            
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ON', 
    "productType" TEXT,               
    "variationsDesign" TEXT NOT NULL DEFAULT 'Grid', 
    "resellerPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0, 
    "tutorialLink" TEXT,               
    
    "isFreeFireAuto" BOOLEAN NOT NULL DEFAULT false,
    "isUidNameChecker" BOOLEAN NOT NULL DEFAULT false, 
    "isCoinSystem" BOOLEAN NOT NULL DEFAULT false,    
    "isPremiumUser" BOOLEAN NOT NULL DEFAULT false,  
    "isBanner" BOOLEAN NOT NULL DEFAULT false,       
    
    "variationIcon" TEXT,             
    "bannerImage" TEXT,               
    "autoDeliveryType" TEXT,           
    "description" TEXT,                
    
    "isUrlProduct" BOOLEAN NOT NULL DEFAULT false,
    "linkUrl" TEXT,
    "productTag" TEXT,
    "autoDeliveryWith" TEXT,
    "categoryType" TEXT,              
    "ffNameChecker" BOOLEAN NOT NULL DEFAULT false,
    "dynamicFields" JSONB NOT NULL DEFAULT '["Enter UID"]',
    "rulesCondition" TEXT,           
    "itemBottomText" TEXT,
    "footerLink" TEXT,
    "categoryId" TEXT NOT NULL,
    
    "isTagEnabled" BOOLEAN NOT NULL DEFAULT true,   -- ট্যাগ অন/অফ ট্র্যাকিং
    "tagType" TEXT NOT NULL DEFAULT 'AUTO',          -- অটো/কাস্টম ট্যাগ
    "tagColor" TEXT DEFAULT '#ffffff',
    "tagBgColor" TEXT DEFAULT '#2563eb',
    "tagIcon" TEXT,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- ✅ New Table Create: Variation
CREATE TABLE "Variation" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "title" TEXT NOT NULL,                -- যেমন: '100 Diamond'
    "amount" DOUBLE PRECISION NOT NULL,   -- যেমন: 100
    "price" DOUBLE PRECISION NOT NULL,    -- যেমন: 85
    "offerPrice" DOUBLE PRECISION,        -- অপশনাল
    "image" TEXT,                         -- অপশনাল
    "status" TEXT NOT NULL DEFAULT 'ON',  -- ON / OFF
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Variation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (Unique constraints)
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- ✅ New Index Create: Performance optimization for massive variation query
CREATE INDEX "Variation_productId_idx" ON "Variation"("productId");

-- AddForeignKey: Product to Category
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ✅ New ForeignKey: Variation to Product (Cascade Delete Logic Active)
ALTER TABLE "Variation" ADD CONSTRAINT "Variation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;