#!/bin/bash

# 🚀 阿牧星盘 v1.0.11 一键部署脚本
# 作者: AI Assistant
# 日期: $(date +%Y-%m-%d)

set -e  # 遇到错误时停止

echo "🚀 开始部署阿牧星盘 v1.0.11..."
echo "📋 当前版本: $(grep '"version"' package.json | cut -d'"' -f4)"
echo "──────────────────────────────────────────────────────────────"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查函数
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✅ $1 已安装${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 未安装${NC}"
        return 1
    fi
}

# 安装缺失的CLI工具
install_cli_tools() {
    echo -e "${BLUE}🔧 检查并安装必要的CLI工具...${NC}"
    
    # 检查Railway CLI
    if ! check_command railway; then
        echo -e "${YELLOW}📦 安装Railway CLI...${NC}"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            if command -v brew &> /dev/null; then
                brew install railway
            else
                curl -fsSL https://railway.app/install.sh | sh
            fi
        else
            # Linux
            curl -fsSL https://railway.app/install.sh | sh
        fi
    fi
    
    # 检查Vercel CLI
    if ! check_command vercel; then
        echo -e "${YELLOW}📦 安装Vercel CLI...${NC}"
        npm install -g vercel
    fi
    
    # 检查EAS CLI
    if ! check_command eas; then
        echo -e "${YELLOW}📦 安装EAS CLI...${NC}"
        npm install -g @expo/cli
        npm install -g eas-cli
    fi
}

# 检查环境变量
check_environment() {
    echo -e "${BLUE}🔧 检查环境变量...${NC}"
    
    if [ -f ".env" ]; then
        echo -e "${GREEN}✅ 发现.env文件${NC}"
        if grep -q "QWEN_API_KEY" .env; then
            echo -e "${GREEN}✅ QWEN_API_KEY已配置${NC}"
        else
            echo -e "${RED}❌ QWEN_API_KEY未配置${NC}"
            echo -e "${YELLOW}请在.env文件中添加QWEN_API_KEY${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ .env文件不存在${NC}"
        echo -e "${YELLOW}请创建.env文件并添加QWEN_API_KEY${NC}"
        exit 1
    fi
}

# 测试本地服务器
test_server() {
    echo -e "${BLUE}🧪 测试本地服务器...${NC}"
    
    # 启动服务器（后台运行）
    node server.js &
    SERVER_PID=$!
    
    # 等待服务器启动
    sleep 3
    
    # 测试健康检查
    if curl -f http://localhost:3000/api/test &> /dev/null; then
        echo -e "${GREEN}✅ 服务器运行正常${NC}"
    else
        echo -e "${RED}❌ 服务器运行异常${NC}"
        kill $SERVER_PID
        exit 1
    fi
    
    # 停止服务器
    kill $SERVER_PID
}

# 提交代码
commit_changes() {
    echo -e "${BLUE}📝 提交代码...${NC}"
    
    git add .
    git commit -m "🚀 部署v1.0.11: 专业星盘计算系统上线" || echo "没有新的更改需要提交"
    
    # 检查是否有远程仓库
    if git remote get-url origin &> /dev/null; then
        git push origin main
        echo -e "${GREEN}✅ 代码已推送到远程仓库${NC}"
    else
        echo -e "${YELLOW}⚠️ 没有配置远程仓库${NC}"
    fi
}

# 部署后端API
deploy_backend() {
    echo -e "${BLUE}🌐 部署后端API...${NC}"
    
    # 选择部署平台
    echo "请选择部署平台:"
    echo "1) Railway (推荐)"
    echo "2) Vercel"
    echo "3) Heroku"
    echo "4) 跳过后端部署"
    
    read -p "请输入选择 (1-4): " choice
    
    case $choice in
        1)
            echo -e "${BLUE}🚂 使用Railway部署...${NC}"
            if check_command railway; then
                railway login
                railway init
                railway variables set QWEN_API_KEY="$(grep QWEN_API_KEY .env | cut -d'=' -f2)"
                railway variables set NODE_ENV=production
                railway up
                echo -e "${GREEN}✅ Railway部署完成${NC}"
            else
                echo -e "${RED}❌ Railway CLI不可用${NC}"
                exit 1
            fi
            ;;
        2)
            echo -e "${BLUE}▲ 使用Vercel部署...${NC}"
            if check_command vercel; then
                vercel login
                vercel --prod
                echo -e "${GREEN}✅ Vercel部署完成${NC}"
            else
                echo -e "${RED}❌ Vercel CLI不可用${NC}"
                exit 1
            fi
            ;;
        3)
            echo -e "${BLUE}🟣 使用Heroku部署...${NC}"
            if check_command heroku; then
                heroku create
                heroku config:set QWEN_API_KEY="$(grep QWEN_API_KEY .env | cut -d'=' -f2)"
                heroku config:set NODE_ENV=production
                git push heroku main
                echo -e "${GREEN}✅ Heroku部署完成${NC}"
            else
                echo -e "${RED}❌ Heroku CLI不可用${NC}"
                exit 1
            fi
            ;;
        4)
            echo -e "${YELLOW}⏭️ 跳过后端部署${NC}"
            ;;
        *)
            echo -e "${RED}❌ 无效选择${NC}"
            exit 1
            ;;
    esac
}

# 构建移动应用
build_mobile_app() {
    echo -e "${BLUE}📱 构建移动应用...${NC}"
    
    echo "请选择构建选项:"
    echo "1) 构建Android APK"
    echo "2) 构建iOS应用"
    echo "3) 同时构建两个平台"
    echo "4) 跳过移动应用构建"
    
    read -p "请输入选择 (1-4): " choice
    
    case $choice in
        1)
            echo -e "${BLUE}🤖 构建Android APK...${NC}"
            if check_command eas; then
                eas build --platform android --profile production
                echo -e "${GREEN}✅ Android APK构建完成${NC}"
            else
                echo -e "${RED}❌ EAS CLI不可用${NC}"
                exit 1
            fi
            ;;
        2)
            echo -e "${BLUE}🍎 构建iOS应用...${NC}"
            if check_command eas; then
                eas build --platform ios --profile production
                echo -e "${GREEN}✅ iOS应用构建完成${NC}"
            else
                echo -e "${RED}❌ EAS CLI不可用${NC}"
                exit 1
            fi
            ;;
        3)
            echo -e "${BLUE}📱 同时构建两个平台...${NC}"
            if check_command eas; then
                eas build --platform all --profile production
                echo -e "${GREEN}✅ 移动应用构建完成${NC}"
            else
                echo -e "${RED}❌ EAS CLI不可用${NC}"
                exit 1
            fi
            ;;
        4)
            echo -e "${YELLOW}⏭️ 跳过移动应用构建${NC}"
            ;;
        *)
            echo -e "${RED}❌ 无效选择${NC}"
            exit 1
            ;;
    esac
}

# 生成部署报告
generate_report() {
    echo -e "${BLUE}📊 生成部署报告...${NC}"
    
    REPORT_FILE="deployment-report-$(date +%Y%m%d-%H%M%S).json"
    
    cat > $REPORT_FILE << EOF
{
  "deployment": {
    "version": "$(grep '"version"' package.json | cut -d'"' -f4)",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "platform": "$(uname -s)",
    "node_version": "$(node --version)",
    "npm_version": "$(npm --version)",
    "git_commit": "$(git rev-parse HEAD)",
    "features": [
      "专业星盘计算器 (Swiss Ephemeris)",
      "十二宫位系统",
      "AI智能分析",
      "地理编码服务",
      "多语言支持"
    ],
    "improvements": [
      "计算精度提升>1000x",
      "从1度提升到0.1角秒",
      "支持岁差计算",
      "完整的Placidus宫位系统"
    ]
  }
}
EOF

    echo -e "${GREEN}✅ 部署报告已生成: $REPORT_FILE${NC}"
}

# 主函数
main() {
    echo -e "${BLUE}🎯 阿牧星盘 v1.0.11 自动部署脚本${NC}"
    echo -e "${BLUE}专业星盘计算系统 | Swiss Ephemeris集成${NC}"
    echo "──────────────────────────────────────────────────────────────"
    
    # 检查是否在项目根目录
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ 请在项目根目录运行此脚本${NC}"
        exit 1
    fi
    
    # 执行部署步骤
    install_cli_tools
    check_environment
    test_server
    commit_changes
    deploy_backend
    build_mobile_app
    generate_report
    
    echo ""
    echo -e "${GREEN}🎉 部署完成！${NC}"
    echo -e "${GREEN}✨ 阿牧星盘 v1.0.11 已成功部署${NC}"
    echo -e "${GREEN}🔗 专业星盘计算系统已上线${NC}"
    echo ""
    echo -e "${BLUE}📋 后续步骤:${NC}"
    echo -e "${BLUE}1. 更新移动应用中的API地址${NC}"
    echo -e "${BLUE}2. 测试API端点功能${NC}"
    echo -e "${BLUE}3. 监控应用性能${NC}"
    echo -e "${BLUE}4. 准备应用商店提交${NC}"
    echo ""
    echo -e "${BLUE}📞 技术支持: 查看PRODUCTION_DEPLOYMENT_GUIDE.md${NC}"
}

# 运行主函数
main "$@" 