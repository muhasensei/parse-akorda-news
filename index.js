const axios = require('axios').default;
const fs = require('fs');
const jsdom = require("jsdom");

const baseUrl = 'https://www.akorda.kz'
let data = '';
let articleUrls = [];
const pages = new Array(5).fill(0);



const stringToHTML = function (str) {
  const dom = new jsdom.JSDOM(str);
	return dom.window.document.body;
};

const getAllLinks = (document) => {
  let x = document.querySelectorAll(".card a");
  let resultArray = []
  for (let i=0; i<x.length; i++){
    let hrefLink = x[i].href;
    resultArray.push(hrefLink);
  };
  return resultArray;
}

const getArticleContent = (article) => {
  let x = article.querySelectorAll(".mt-5 p");
  let contentText = ''
  for (let i=0; i<x.length; i++){
    contentText += x[i].textContent;
  };
  return contentText;
}

const writeDataToFile = (data) => {
  fs.writeFile("test.txt", data, (err) => {
    if (err) console.log(err);
  });
  console.log('text writing finish')
}

// get links

const linkPromises = pages.map(async (curr, key) => {
  await axios.get(`${baseUrl}/kz/events?page=${key + 1}`)
    .then((response) => {
      const docBody = stringToHTML(response.data)
      articleUrls = articleUrls.concat(getAllLinks(docBody))
    })
    .catch((error) => {
      console.log(error);
  });
})


Promise.all(linkPromises).then(() => {
  console.log('articleUrls.length: ', articleUrls.length)


  const articlePromises = articleUrls.map(async (article) => {
    await axios.get(`${baseUrl}${article}`)
      .then((response) => {
        const docBody = stringToHTML(response.data)
        data += getArticleContent(docBody);
      })
      .catch((error) => {
        console.log(error);
    });
  })

  Promise.all(articlePromises).then((res) => {
    writeDataToFile(data)
  }).catch((err) => {
    console.log(err)
  })
})


