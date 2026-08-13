import { ittfPingPong } from 'ittf-pingpong';

const client = new ittfPingPong();
const rankings = await client.currentRankings('SEN', 'M', 'S', 5);
console.log(JSON.stringify(rankings, null, 2));
