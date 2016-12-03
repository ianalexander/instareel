require('dotenv').config();
const rp = require('request-promise');
const moment = require('moment');

const REEL_URL = 'https://i.instagram.com/api/v1/feed/reels_tray/';

// These are required
const HEADERS = {
  'X-IG-Capabilities': '3wo=',
  'User-Agent': 'Instagram 10.0.1 (iPhone9,1; iOS 10_1_1; en_US; en-US; scale=2.00; 750x1334) AppleWebKit/420+',
  'Cookie': `ds_user_id=${process.env.DS_USER_ID}; sessionid=${process.env.SESSIONID};`
}

console.log('instareel');

console.log('[ ] checking for .env...');
if (!process.env.DS_USER_ID || !process.env.SESSIONID) {
  console.log('[!] error, please set env vars.');
  process.exit(1);
}

console.log('[ ] requesting reel...')
rp({
  url: REEL_URL,
  headers: HEADERS,
  json: true
}).then(function (resp) {
  console.log('[ ] got reel! Parsing...');
  const result = resp.tray.map(e => {
    const username = e.user.username;
    const unread_count = e.items ? e.items.filter((i) => i.video_versions).length : 0;
    let unread_stories;
    if (unread_count > 0) {
      unread_stories = e.items.map(
        (e) => e.video_versions ? {
          url: e.video_versions[0].url,
          taken_at: moment(e.taken_at*1000).fromNow()
        } : undefined
      ).filter((e) => e);
    }
    return {
      username,
      unread_count,
      unread_stories
    }
  });
  console.log(JSON.stringify(result, null, 2));
})
.catch(function (err) {
  console.log('error: ', err);
})
