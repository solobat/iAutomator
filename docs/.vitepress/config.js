export default {
  title: 'iAutomator',
  description: 'Chrome 扩展：常用浏览器操作的便捷与自动化',
  type: 'module',
  themeConfig: {
    logo: '/icon.png',
    siteTitle: 'iAutomator',
    nav: [
      { text: '首页', link: '/' },
      {
        text: '文档',
        items: [
          { text: '文档 (英文)', link: '/doc_en' },
          { text: '文档 (中文)', link: '/index_cn' },
          { text: 'IScript (英文)', link: '/IScript_en' },
          { text: 'IScript (中文)', link: '/IScript' },
        ],
      },
      { text: '隐私权政策', link: '/privacy' },
    ],
    sidebar: {
      '/': [],
      '/doc_en': [
        { text: 'Documentation (EN)', link: '/doc_en' },
      ],
      '/index_cn': [
        { text: '文档 (中文)', link: '/index_cn' },
      ],
      '/IScript_en': [
        { text: 'IScript (EN)', link: '/IScript_en' },
      ],
      '/IScript': [
        { text: 'IScript (中文)', link: '/IScript' },
      ],
      '/privacy': [],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/solobat/iAutomator' },
    ],
    footer: {
      message: '基于 MIT 协议开源',
      copyright: 'Copyright © iAutomator',
    },
    outline: { level: [2, 4], label: '本页目录' },
  },
}
