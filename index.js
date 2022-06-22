const axios = require('axios').default;
const fs = require('fs');
const jsdom = require("jsdom");

const baseUrl = 'https://www.akorda.kz'
let data = '';
let articleUrls = [];


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
  let x = article.querySelectorAll(".mt-5 article p");
  let contentText = ''
  for (let i=0; i<x.length; i++){
    contentText += x[i].textContent + '\n';
  };
  return contentText + '///';
}

const writeDataToFile = (data, fileName = 'article-texts') => {
  fs.writeFile(`${fileName}.txt`, data, (err) => {
    if (err) console.log(err);
  });
  console.log('text writing finish')
}

// reading links and writng articles to file

fs.promises.readFile("article-links.txt")
.then(function(result) {
  articleUrls = (result + '')?.split(';')?.slice(0, 1200)
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
    writeDataToFile(data, 'article-texts')
  }).catch((err) => {
    console.log(err)
  })
})
.catch(function(error) {
   console.log(error);
})


/*

// checking article length

fs.promises.readFile("article-texts.txt")
.then(function(result) {
  console.log((result + '')?.split('///')?.length);
})
.catch(function(error) {
   console.log(error);
})

*/


/*
// getting links and writing to file
const pages = new Array(660).fill(0);

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
})

*/





