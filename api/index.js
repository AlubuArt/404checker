import express from 'express';
const app = express();
const port = 3000;
import {run} from '../checkerTrigger/index.js';
import {getCache, setCache} from '../checkerTrigger/cache.js';
import {string1, string2} from '../checkerTrigger/urls.js';




app.get('/api/crawl', async (req, res) => {
    const cacheKey1 = 'key1';
    const cacheKey2 = 'key2'

    try {
      let data1 = getCache(cacheKey1);
      let data2 = getCache(cacheKey2);
      if(!data1) {
       data1 = await run(string1); 
       setCache(cacheKey1, JSON.stringify(data1));
      } if (!data2) {
        data2 = await run(string2);
        setCache(cacheKey2, JSON.stringify(data2));
      } else {
        data1 = JSON.parse(data1);
        data2 = JSON.parse(data2);
      }

      let errors = data1.errorUrls.concat(data2.errorUrls);
      let noResponse = data1.noResponse.concat(data2.noResponse);
      return res.json({result: {
        'Checked URLs in total ': data1.sum + data2.sum,
        'OK in total: ': data1.i.length + data2.i.length,
        'Errors: ': errors,
        'No response: ': noResponse
      },
      message: 'Remember to check errors and no response results manually.'
    });
    } catch (error) {
      return res.status(500).json({message: 'internal server error'})
    }
})


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  
export default app