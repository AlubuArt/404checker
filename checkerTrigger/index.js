import nodemailer from 'nodemailer';
import {string} from './urls.js';
import axios from 'axios';
import http from 'http';
import * as dotenv from 'dotenv';
import async from 'async';


const httpAgent = new http.Agent({keepAlive: true, KeepAliveMsecs: 10000})
const instance = axios.create({httpAgent: httpAgent})


function stringToArray(inputString) {
  // Split the input string by newline character and filter out any empty strings
  return inputString.split('\n').filter(url => url.trim() !== '');
}



export const getHttpsStatus = async () => {
    const urls = stringToArray(string);

    // Concurrency limit
    const concurrencyLimit = 10;

    const getStatus = async (url) => {
        try {
            const res = await axios.get(url, instance);
            return { url: url, statusCode: res ? res.status : 'No response' };
        } catch (err) {
            return { url: url, statusCode: err.response ? err.response.status : 'Error' };
        }
    };

    const limitedGetStatus = async.reflectAll(urls.map(url => async () => getStatus(url)));

    return new Promise((resolve, reject) => {
        async.parallelLimit(limitedGetStatus, concurrencyLimit, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results.map(result => result.value));
            }
        });
    });
};


export const checkStatus = async (arr) => {
    const errors = []
    const statusOK = []
    const statusNotOK = []
    await arr.map((x) => {
      if(x.statusCode >= 200 && x.statusCode < 400) {
        statusOK.push(x)
        return
      } if (x.statusCode > 399) {
        statusNotOK.push(x)
        return
      } else {
        errors.push(x)
        return
      }
    }) 
  return [statusOK, statusNotOK, errors]
  
}

const sendMail = async (sum, statusNotOk, errors, statusOK) => {
    let transporter = nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      ports: 465,
      secure: false,
      auth: {
        user: 'apikey', 
        pass: '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'
      },
    });
  
    let info = await transporter.sendMail({
      from: 'jacobc@its.aau.dk', // sender address
      to: "jc@jcvisueldesign.dk",
      //cc: "jacobc@its.aau.dk",
      subject: "Daily Impact Ranking 404 check", // Subject line
      text: `Hej Troels
      Her er din daglige Impact Ranking oversigt.
      Der blev i alt undersøgt ${JSON.stringify(sum)} sider. 
      ${statusOK.length} sider returnerede OK.

      Følgende sider returnede <b>IKKE</b> en 200 OK: 
      ${JSON.stringify(statusNotOk)} </p>

      Følgende sider gav ikke et svar: 
      ${JSON.stringify(errors)}
      Jacob´s mailer minion

      Mvh
    
      `, // plain text body
      html: `<p>Hej Troels
      <br>
      <br>Her er din daglige Impact Ranking 404 oversigt.
      <br>
      <br> Der blev i alt undersøgt ${JSON.stringify(sum)} sider.
      <br>
      <br> ${statusOK.length} sider returnerede OK.
      <br>
      <br> Følgende sider returnede <b>IKKE</b> en 200 OK: 
      <br> ${JSON.stringify(statusNotOk)} </p>
      <br>
      <br> Følgende sider gav ikke et svar: 
      <br> ${JSON.stringify(errors)}
      <br>
      <br> <i>Mvh</i>
      <br> <i>Jacob´s mailer minion</i>`, 
    });
  
  }
export const run = async (context, myTimer) => {
    const p = await getHttpsStatus();
    const sum = p.length;
    const [i, k, r] = await checkStatus(p); 
    const errorUrls = k.map(error => error.url)
    const noResponse = r.map(response => response.url)
    
/*     console.log("Checked URL´s in total: " + sum)
    console.log("200´s in total: " + i.length)
    console.log("Errors: " + JSON.stringify(k))
    console.log("No response: " + JSON.stringify(r)) */

    return { i, errorUrls , noResponse, sum}
  }
//run()

/* export default run; */

