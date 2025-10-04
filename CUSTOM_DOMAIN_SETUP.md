# 🌐 Custom Domain Setup Guide

## Setup Domain: `stockai.gavinadlan.my.id`

### 📋 **Yang Sudah Diubah:**

1. ✅ **GitHub Actions Workflow** - Updated untuk CloudFront deployment
2. ✅ **Setup Script** - Script otomatis untuk CloudFront + SSL
3. ✅ **S3 Configuration** - Changed dari public access ke CloudFront-only

---

## 🚀 **Langkah-langkah Setup:**

### **1. Jalankan Setup Script**
```bash
# Pastikan AWS CLI sudah configured
aws configure

# Jalankan script setup
./setup-custom-domain.sh
```

### **2. Validasi SSL Certificate**
Setelah script selesai, Anda akan mendapat Certificate ARN. Validasi via DNS:

```bash
# Get certificate details
aws acm describe-certificate \
  --certificate-arn "arn:aws:acm:us-east-1:1758970542:certificate/xxxxx" \
  --region us-east-1

# Add DNS records di Domainesia sesuai output di atas
```

### **3. Update DNS Records di Domainesia**
Di panel Domainesia, tambahkan:
- **Type**: CNAME
- **Name**: stockai
- **Value**: `[DISTRIBUTION_ID].cloudfront.net`
- **TTL**: 300

### **4. Update GitHub Actions**
Ganti `E1234567890ABCD` di workflow dengan Distribution ID yang didapat dari script.

---

## 🔧 **Manual Setup (Jika Script Gagal):**

### **Step 1: Request SSL Certificate**
```bash
aws acm request-certificate \
  --domain-name "stockai.gavinadlan.my.id" \
  --validation-method DNS \
  --region us-east-1
```

### **Step 2: Create Origin Access Control**
```bash
aws cloudfront create-origin-access-control \
  --origin-access-control-config '{
    "Name": "stockai-oac",
    "Description": "OAC for stockai.gavinadlan.my.id",
    "SigningProtocol": "sigv4",
    "SigningBehavior": "always",
    "OriginAccessControlOriginType": "s3"
  }'
```

### **Step 3: Create CloudFront Distribution**
```bash
# Gunakan AWS Console untuk ini karena JSON config terlalu panjang
# Atau gunakan script yang sudah dibuat
```

---

## 📊 **Architecture Baru:**

```
Internet → Domainesia DNS → CloudFront → S3 Bucket
    ↓
stockai.gavinadlan.my.id → [DISTRIBUTION].cloudfront.net → staging-stock-market-chat-frontend-1758970542
```

**Benefits:**
- ✅ **SSL/HTTPS** - Otomatis dengan AWS Certificate Manager
- ✅ **CDN** - CloudFront untuk performa global
- ✅ **Security** - S3 tidak public, hanya CloudFront yang bisa akses
- ✅ **Custom Domain** - Professional domain name

---

## ⚠️ **Important Notes:**

1. **SSL Certificate** harus di region `us-east-1` (CloudFront requirement)
2. **DNS Validation** harus selesai sebelum CloudFront aktif
3. **CloudFront Deployment** butuh 5-15 menit
4. **Distribution ID** harus diupdate di GitHub Actions workflow

---

## 🧪 **Testing:**

### **Test SSL Certificate:**
```bash
curl -I https://stockai.gavinadlan.my.id
# Should return 200 OK with HTTPS
```

### **Test CloudFront:**
```bash
# Check CloudFront status
aws cloudfront get-distribution --id [DISTRIBUTION_ID]
```

### **Test DNS:**
```bash
nslookup stockai.gavinadlan.my.id
# Should resolve to CloudFront IP
```

---

## 💰 **Cost Impact:**

- **CloudFront**: ~$0.085 per GB transfer (first 10TB free)
- **SSL Certificate**: Free dengan AWS Certificate Manager
- **S3**: Same cost (storage only, no transfer charges)

**Estimated additional cost: $2-5/month** untuk traffic normal.

---

## 🎯 **Timeline:**

1. **Setup Script**: 5 menit
2. **SSL Validation**: 5-10 menit (DNS propagation)
3. **CloudFront Deployment**: 5-15 menit
4. **DNS Propagation**: 5-30 menit

**Total: 20-60 menit** untuk setup lengkap.

---

## 🆘 **Troubleshooting:**

### **SSL Certificate Issues:**
```bash
# Check certificate status
aws acm list-certificates --region us-east-1

# Check validation records
aws acm describe-certificate --certificate-arn [ARN] --region us-east-1
```

### **CloudFront Issues:**
```bash
# Check distribution status
aws cloudfront get-distribution --id [DISTRIBUTION_ID]

# Check cache invalidation
aws cloudfront list-invalidations --distribution-id [DISTRIBUTION_ID]
```

### **DNS Issues:**
```bash
# Test DNS resolution
dig stockai.gavinadlan.my.id
nslookup stockai.gavinadlan.my.id
```

---

## ✅ **Success Checklist:**

- [ ] SSL Certificate validated
- [ ] CloudFront Distribution active
- [ ] DNS records pointing to CloudFront
- [ ] GitHub Actions updated dengan Distribution ID
- [ ] S3 bucket policy updated
- [ ] Website accessible via https://stockai.gavinadlan.my.id

**🎉 Setelah semua checklist selesai, website Anda akan live di custom domain!**
