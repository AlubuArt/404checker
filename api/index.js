import express from 'express';
const app = express();
const port = 3000;
import {run} from '../checkerTrigger/index.js';
import {getCache, setCache} from '../checkerTrigger/cache.js';




app.get('/api/crawl', async (req, res) => {
    const cacheKey = 'crawlData_2024';

    try {
      let data = getCache(cacheKey);
      if(!data) {
       data = await run(); 
       setCache(cacheKey, JSON.stringify(data));
      } else {
        data = JSON.parse(data);
      }
      return res.json({result: {
        'Checked URLs in total ': data.sum,
        'OK in total ': data.i.length,
        'Errors: ': data.errorUrls,
        'No response: ': data.noResponse
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