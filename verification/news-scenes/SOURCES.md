# 应用场景与新闻资料

核验日期：2026-10-05。图片为行业场景配图，不表示客户、合作机构或产品实际使用现场。

## 新闻与知识原文

- UNEP / FAO，2022-11-12，《Sustainable Food Cold Chains: Opportunities, Challenges and the Way Forward》：https://www.unep.org/resources/report/sustainable-food-cold-chains-opportunities-challenges-and-way-forward
  - 已读取正文：14% 食品损失估计及可持续冷链建议。数字为该报告口径。
- CDC，2026-07-14，《Non-Emergency Vaccine Transport》：https://www.cdc.gov/vaccines/hcp/storage-handling/transport.html
  - 已读取正文：合适容器、运输日志、连续温度监测；普通食品/饮料保温箱不等于合格疫苗容器。本页不是 ChillLink 的医疗运输认证。
- FDA，2024-03-05，《Selecting and Serving Fresh and Frozen Seafood Safely》：https://www.fda.gov/food/buy-store-serve-safe-food/selecting-and-serving-fresh-and-frozen-seafood-safely
  - 已读取正文：防交叉污染、清洁保温箱、少开盖，冷冻并不杀死所有有害微生物。
- BioPharma Dive / Cryopak，2026-01-12，《Building more sustainable cold chain packaging through innovation》：https://www.biopharmadive.com/spons/building-more-sustainable-cold-chain-packaging-through-innovation/808687/
  - PDF 资料汇编引用该文章：全球 EPS 包装年产量约 450–500 万吨，回收约 120–150 万吨，约 24–30%。网页标注为来源文章估算，不外推到所有地区或所有 EPS 产品。
- Karrech 等，2025-03，《A systematic review on the recycling of polyurethane products from offshore applications》：https://www.sciencedirect.com/science/article/pii/S2773167725000044
  - PDF 资料汇编引用该综述。网页仅概括“PU 回收路径和阻燃剂会影响处理难度”，没有把“低于 10%”作为所有 PU 的统一回收率。

## 用户提供 PDF 的核对范围

- 追加在线核验（2026-10-05）：IIR 原站 2025-11-04 公告已读取正文，确认三份简报的领域与能效、温控、制冷剂及发泡剂范围。https://iifiir.org/en/news/press-release-strengthening-cold-chains-unep-and-iir-release-three-technology-briefs-and-announce-webinar-series-2da3c68c-49ad-4d03-b6c6-fa610bd6caa1
- BioPharma Dive 原文已核对发布日期及 EPS 估算数字；文章明确为 Cryopak 的 SPONSORED 内容，网页也标明赞助内容，不能视作独立统计机构数据。
- CK Supply 原文已读取，确认工业副产 CO₂、约 −78.5 °C 升华和无液态残留。页面未显示发布日期，因此仅作为知识来源，不标为新发布新闻：https://cksupply.com/the-environmental-impact-of-dry-ice-a-closer-look/
- ScienceDirect 原站当前返回访问验证页；PU 条目根据 PDF 中完整引用段落整理，未声称已在线核验全文，也未使用其“低于 10%”数字。
- PDF 的澳大利亚 EPS 数据是 2019–20 年度且来自商业博客，未加入网页；真空隔热板与凝胶包标题下没有提供可核验数字，因此没有添加对应污染或回收率断言。
- 干冰是冷源，泡沫与真空隔热板是保温材料；不把两类功能当成直接替代，也不宣称已测得本产品减排比例。2004 年 CDC 历史案例已经从所有语言新闻列表移除。

- [Very-Offensive Researches.pdf](/Users/Liam/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/wxid_vzs31wc5iit722_c4b4/temp/RWTemp/2026-10/205d3d17db7f46dbbc3fd3075721a5be/Very-Offensive%20Researches.pdf)：两页资料汇编，列出 EPS 泡沫箱、PU 泡沫、真空隔热板、凝胶包/冰袋与干冰的比较线索。
  - 可用于网页的事实边界：干冰约 −78.5 °C 升华且不留下液态融水；干冰常由工业过程捕集的 CO₂ 制成，但环境表现仍取决于来源、制备、运输、升华和通风管理。
  - PDF 中关于 EPS、PU 回收率的数字保留原始来源和估算属性；没有把“干冰环保”写成零污染、零碳排或适用于所有货品。

## 图片来源

已通过 Unsplash 网页搜索检查图片及免费图片链接，压缩本地存放以保证加载稳定。

| 文件 | 页面 / 作者 |
|---|---|
| scene-sushi.jpg | https://unsplash.com/photos/iOHJKJqO6E0 / Jakub Dziubak |
| scene-medical.jpg | https://unsplash.com/photos/0jE8ynV4mis / Testalize.me |
| scene-lab.jpg | https://unsplash.com/photos/RlOAwXt2fEA / Julia Koblitz |
| scene-restaurant.jpg | https://unsplash.com/photos/y-XZf_TNRms / novokayn |
| scene-dessert.jpg | https://unsplash.com/photos/66IZaW9LIpI / Courtney Cook |
| scene-cold-food.jpg | https://images.unsplash.com/photo-1547592180-85f173990554 / 沙拉配餐图 |

授权说明：https://unsplash.com/license

## 性能数据

- 33 L、−25～+10 °C、单个 120×120 mm 风扇：用户确认参数。
- 0.5 °C 步进、约 2 秒采样、PID 20–100%：Code /SC8_CO2_ESP32/src/main.cpp。
- 达到或低于目标温度，当前固件会将风扇设为 0%；20–100% 为运行时 PID 输出区间。
- src/data/experiments.json 三组 series 均为空；立项书未提供续航、降温实测值。
- 保冷续航、电控续航、降温时间和速率仅列出指标及影响因素，未填写没有依据的数值。

## 1688 耗材价格核对（2026-10-05）

- 1688 站内搜索：https://s.1688.com/selloffer/offer_search.htm?keywords=%B8%C9%B1%F9
- 页面搜索结果显示：250 g 袋装干冰约 ¥1.50；食品级/电商冷链干冰多条结果约 ¥3.00；部分块状/颗粒干冰商品约 ¥6.00；这些是搜索结果展示价，不含地区运费、最低起订量、规格差异和损耗。
- 同页还显示水冰袋约 ¥0.07–0.34/个，但水冰袋无法直接代表 −25 至 +10 °C 干冰冷源的性能，因此仅作为外部耗材参考。
- 网页只采用明确标题规格的 250 g / ¥1.50 挂牌价，折算约 ¥6/kg。1 kg 装填预算约 ¥6，不代表实际单次消耗。详情 SKU、起订量、运费尚未核实；没有把未标单位的 ¥3 或 ¥6 推算成每公斤单价。删除原 ¥8/15/24/31/26 比较及缺乏报价依据的区间。

- 泡沫箱 33L 站内搜索返回混合规格：重庆金彩包装 ¥1.18、上海翊华包装 ¥2.90 等。未确认挂牌 SKU 容积，不能冒充同容量报价。PU 发泡箱结果惠州市爽透 ¥158 是设备采购价，不列入单次耗材。

## 配送方案成本对比更新（2026-10-05）

- 最终口径：一次性包装 + 本次冷源；周转箱首次购置价不计入单次耗材，删除早期 ¥158 箱体混入单次成本的算法。
- 用户提供：33 L EPS ¥9；2.5 kg 水冰 ¥15–20；ChillLink 用干冰 0.5 kg，预算 ¥3/次；¥18/6 kg 折算实际干冰材料费 ¥1.50/0.5 kg。差额没有资料支持，不虚构为运费或升华损耗。
- EPS 无冷源 ¥9；EPS + 水冰 ¥24–29；复用 PU/EPP 箱 + 水冰 ¥15–20，均按上述输入计算，不含人工、电费、运费、折旧和回收。
- 本轮访问 1688 冰袋搜索 https://s.1688.com/selloffer/offer_search.htm?keywords=%B1%F9%B4%FC ：南通宝伦工贸有限公司“定制凝胶冰袋 PE尼龙空白快递运输箱包专用生物冰袋批发”挂牌 ¥0.60；单位、SKU、容量和起订量尚未在详情页确认，网页写作暂按每袋估算，并提供搜索链接。
- EPS + 凝胶袋公式 ¥9 + ¥0.60 × n；5袋示例 ¥12 只是算术示例，不是经验证 33 L 冷源配置。没有使用混合规格搜索最低/最高价拼接单次成本。

## 团队与独立配图更新

团队文案依据项目开发工作与拍摄素材描述，不填未经确认的姓名、职务、学历或获奖经历。所有新增照片来自用户项目文件夹，不代表外部新闻事件现场。

- public/img/team-workshop.jpg ← /Users/Liam/Documents/Sci-Tech Innovation/SP/SryoDrive/拍摄图片/ef2836a06f8c8ed9fad90510859d2dc5.jpg
- public/img/team-design.jpg ← /Users/Liam/Documents/Sci-Tech Innovation/SP/SryoDrive/拍摄图片/ba9bc0fb6b472c156c0dce5f3349cf29.jpg
- public/img/team-build.jpg ← /Users/Liam/Documents/Sci-Tech Innovation/SP/SryoDrive/拍摄图片/57994447d951399dac5bfccb7d2f7a21.jpg
- public/img/team-collaboration.jpg ← /Users/Liam/Documents/Sci-Tech Innovation/SP/SryoDrive/拍摄图片/7c91915a5a3359949db42d5c4155def6.jpg
- public/img/solution-prototype.jpg ← /Users/Liam/Documents/Sci-Tech Innovation/SP/SryoDrive/拍摄图片/b3657507c59cd064ebbf8df6b435f0a4.jpg
- public/img/solution-engineering.jpg ← /Users/Liam/Documents/Sci-Tech Innovation/SP/SryoDrive/拍摄图片/aeaf3f00cd2fb65883add5a5bb45dcfb.jpg
- public/img/solution-cooling.jpg ← /Users/Liam/Documents/Sci-Tech Innovation/SP/SryoDrive/拍摄图片/36acbb933ec02b006d1c59a1d2447ac6.jpg

应用轮播保留原六张行业图片；解决方案使用三张独立项目照片；团队使用四张独立项目照片；新闻两类首图分别使用项目顶视和排气渲染图作为产品配图。

## 团队成员信息

- 成员资料来源：用户提供的成员介绍表格。表格列出梁欣悦（Joyce，CEO）、陈泽宇（James，CRO）、李铭阳（Louis，CMO）、陈姿贝（Zibei，CTO）及其职责简介。
- 表格内嵌一张个人照片，但未提供照片与成员姓名的明确对应关系，因此网页使用姓名首字头像，不将照片错误归属给某位成员。
