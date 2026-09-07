众和品牌图库 V2
================

文件：
- index.html        公开图库
- admin.html        管理后台
- admin.js          多图/视频上传、替换、删除、排序、顶部背景管理
- styles.css        页面样式
- config.js         Supabase 公共连接信息
- logo.png          透明 Logo

部署：
1. 用这些文件覆盖 GitHub 仓库里的同名文件。
2. GitHub Pages 会自动重新发布。
3. 网站首页仍使用当前 GitHub Pages 地址。
4. 管理后台：网站地址/admin.html

重要：
- config.js 里使用的是 Supabase Publishable Key，不是 Secret Key。
- 目前数据库允许 authenticated 用户管理内容；正式上线前建议把后台权限进一步限制为唯一管理员。
- 当前版本一个分类可以有多张图片/视频，首页点击分类进入网页内相册，点击图片弹出大图预览。
