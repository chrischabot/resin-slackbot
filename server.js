const { RTMClient } = require('@slack/client');

const token = process.env.SLACK_TOKEN;

const rtm = new RTMClient(token);
rtm.start();

rtm.on('message', (message) => {
  if ( (message.subtype && message.subtype === 'bot_message') ||
       (!message.subtype && message.user === rtm.activeUserId) ) {
    return;
  }
  console.log(`(channel:${message.channel}) ${message.user} says: ${message.text}`);
  console.log(message);
});

rtm.on('reaction_added', (event) => {
  // Structure of `event`: <https://api.slack.com/events/reaction_added>
  console.log(`Reaction from ${event.user}: ${event.reaction}`);
});
rtm.on('reaction_removed', (event) => {
  // Structure of `event`: <https://api.slack.com/events/reaction_removed>
  console.log(`Reaction removed by ${event.user}: ${event.reaction}`);
});

rtm.on('ready', (event) => {
  const conversationId = 'CA1B2S3AN';
  rtm.sendMessage('Hello there', conversationId);
});

