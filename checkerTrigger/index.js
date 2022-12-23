import nodemailer from 'nodemailer';
import {urls} from './urls.js';
import axios from 'axios';
import http from 'http';

const httpAgent = new http.Agent({keepAlive: true, KeepAliveMsecs: 10000})
const instance = axios.create({httpAgent: httpAgent})

const getHttpsStatus = async () => { 

    return Promise.all(urls.map(async (url) => {
          try {
            const res = await axios.get(url, instance);
            if(res) {
              return {url: url, statusCode: res.status}
            }
        } catch (err) {
          if(err.response) {
            return {url: url, statusCode: err.response.status}
          } else {
            return {url: url, statusCode: err}
          }
        }
    }))
}


const checkStatus = async (arr) => {
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
        user: "apikey", 
        pass: process.env.API_KEY
      },
    });
  
    let info = await transporter.sendMail({
      from: 'jacobc@its.aau.dk', // sender address
      to: "trgu@aub.aau.dk",
      cc: "jacobc@its.aau.dk",
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
const run = async (context, myTimer) => {
    const p = await getHttpsStatus();
    /* context.log(p) */
    const sum = p.length;
    const [i, k, r] = await checkStatus(p); 
    sendMail(sum, k, r, i)
    console.log("Checked URL´s in total: " + sum)
    console.log("200´s in total: " + i.length)
    console.log("Errors: " + JSON.stringify(k))
    console.log("No response: " + JSON.stringify(r))
    context.log("Checked URL´s in total: " + sum)
    context.log("200´s in total: " + i.length)
    context.log("Errors: " + JSON.stringify(k))
    context.log("No response: " + JSON.stringify(r))
  }
/* run() */

export default run;

