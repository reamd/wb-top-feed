fetch('./rss.json')
.then(async function (response) {
  const res = await response.json();
  const items = res.items;

  const list = document.querySelector('.list');

  items.forEach(i => {
    const li = document.createElement('li');
    const p = document.createElement('p');
    const idx = i.id;
    p.innerHTML = `<a href="${i.link}" target="_blank">【${idx === 0 ? '置顶' : idx}】${i.title}</a>`;
    li.appendChild(p);
    list.appendChild(li);
  });
})

