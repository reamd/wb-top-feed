const fetch = require('node-fetch');
const AbortController = require('abort-controller');
const Feed = require('feed').Feed;
const fs = require('fs/promises');
const process = require('process');

const controller = new AbortController();
// 30 秒后取消请求
const timeout = setTimeout(
  () => { controller.abort(); },
  30000,
);

const URL = 'https://v2.alapi.cn/api/new/wbtop';

const feed = new Feed({
  title: '新浪微博热点',
  description: '新浪微博TOP50',
  link: 'https://reamd.github.io/wb-top-feed/',
  language: 'zh-CN',
  generator: 'sina weibo feed generator',
  feedLinks: {
    json: 'https://reamd.github.io/wb-top-feed/rss.json',
    rss: 'https://reamd.github.io/wb-top-feed/rss.xml'
  },
});

async function main() {
    const response = await fetch(URL + '?token=u6prpGW01GQMtCCN', {
      headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.10130'},
      signal: controller.signal
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error('wrong status code');
    }

    const result = await response.json();
    console.log(`successfully fetch the feed.`);

    if (result?.code !== 200) return;

    const items = result.data;
    console.log(`successfully parse the feed.`);

    items.forEach((item, idx) => {
      feed.addItem({
        title: item.hot_word,
        id: idx + 1,
        link: `https://m.weibo.cn/search?containerid=100103type%3D1%26t%3D10%26q%3D%23${item.hot_word}%23`,
      });
    });

    console.log(`successfully generating new feed.`);

    await fs.rmdir('./dist', { recursive: true });
    console.log(`successfully deleted ./dist`);

    await fs.mkdir('./dist');
    console.log(`successfully create ./dist`);

    await fs.writeFile('./dist/rss.json', feed.json1());
    console.log(`successfully write rss.json`);

    await fs.writeFile('./dist/rss.xml', feed.rss2());
    console.log(`successfully write rss.xml`);

    await fs.copyFile('./template/index.html', `./dist/index.html`);
    await fs.copyFile('./template/page.js', `./dist/page.js`);
    console.log(`successfully copy asset files`);

}

main()
.catch(err => {
  console.log(err);
  process.exit(1);
})
.finally(() => {
  clearTimeout(timeout);
});
