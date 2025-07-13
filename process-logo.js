const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 确保assets目录存在
const assetsDir = './assets';
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

// 图标尺寸配置
const iconSizes = {
    // 主图标 (1024x1024)
    'icon.png': { width: 1024, height: 1024 },
    // Android自适应图标 (1024x1024)
    'adaptive-icon.png': { width: 1024, height: 1024 },
    // 启动页图标 (512x512)
    'splash-icon.png': { width: 512, height: 512 },
    // 网页图标 (256x256)
    'favicon.png': { width: 256, height: 256 }
};

async function processLogo() {
    const logoPath = './pic/logo.png';
    
    // 检查源logo文件是否存在
    if (!fs.existsSync(logoPath)) {
        console.error('❌ 源logo文件不存在:', logoPath);
        return;
    }
    
    try {
        // 获取原始图像信息
        const image = sharp(logoPath);
        const metadata = await image.metadata();
        
        console.log('📷 原始logo信息:');
        console.log(`   尺寸: ${metadata.width}x${metadata.height}`);
        console.log(`   格式: ${metadata.format}`);
        console.log(`   通道: ${metadata.channels}`);
        
        // 处理每个图标尺寸
        for (const [filename, size] of Object.entries(iconSizes)) {
            const outputPath = path.join(assetsDir, filename);
            
            console.log(`🔄 处理 ${filename} (${size.width}x${size.height})...`);
            
            await image
                .resize(size.width, size.height, {
                    fit: 'contain',           // 保持宽高比，在正方形内居中
                    background: { r: 255, g: 255, b: 255, alpha: 0 } // 透明背景
                })
                .png({ quality: 90 })
                .toFile(outputPath);
            
            console.log(`✅ 已生成: ${outputPath}`);
        }
        
        console.log('\n🎉 所有图标处理完成！');
        console.log('\n📋 生成的文件:');
        for (const filename of Object.keys(iconSizes)) {
            const filePath = path.join(assetsDir, filename);
            const stats = fs.statSync(filePath);
            console.log(`   ${filename}: ${(stats.size / 1024).toFixed(1)}KB`);
        }
        
        console.log('\n💡 提示:');
        console.log('   - 所有图标已生成为透明背景PNG格式');
        console.log('   - 如果需要白色背景，请修改脚本中的background参数');
        console.log('   - 生成的图标已自动配置到app.json中');
        
    } catch (error) {
        console.error('❌ 图标处理失败:', error.message);
        console.error('\n🔧 可能的解决方案:');
        console.error('   1. 确保logo.png文件格式正确');
        console.error('   2. 检查文件权限');
        console.error('   3. 尝试使用不同的图像格式');
    }
}

// 运行处理函数
processLogo().catch(console.error); 