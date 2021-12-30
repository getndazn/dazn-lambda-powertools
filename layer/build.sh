#!/bin/sh
cd nodejs

echo 'installing DAZN powertools'
npm install @buyerassist/dazn-lambda-powertools-cloudwatchevents-client
npm install @buyerassist/dazn-lambda-powertools-correlation-ids
npm install @buyerassist/dazn-lambda-powertools-dynamodb-client
npm install @buyerassist/dazn-lambda-powertools-eventbridge-client
npm install @buyerassist/dazn-lambda-powertools-firehose-client
npm install @buyerassist/dazn-lambda-powertools-http-client
npm install @buyerassist/dazn-lambda-powertools-kinesis-client
npm install @buyerassist/dazn-lambda-powertools-lambda-client
npm install @buyerassist/dazn-lambda-powertools-logger
npm install @buyerassist/dazn-lambda-powertools-middleware-correlation-ids
npm install @buyerassist/dazn-lambda-powertools-middleware-log-timeout
npm install @buyerassist/dazn-lambda-powertools-middleware-obfuscater
npm install @buyerassist/dazn-lambda-powertools-middleware-sample-logging
npm install @buyerassist/dazn-lambda-powertools-middleware-stop-infinite-loop
npm install @buyerassist/dazn-lambda-powertools-pattern-basic
npm install @buyerassist/dazn-lambda-powertools-pattern-obfuscate
npm install @buyerassist/dazn-lambda-powertools-sns-client
npm install @buyerassist/dazn-lambda-powertools-sqs-client
npm install @buyerassist/dazn-lambda-powertools-step-functions-client

cd ..
cd ..

echo "current path:" `pwd`
VERSION=`cat lerna.json | jq -r '.version'`
echo "current lerna version is:" $VERSION

cd layer
echo "current path:" `pwd`
echo "incrementing template.yml's version"
PATTERN="<VERSION>"
sed "s/${PATTERN}/${VERSION}/g" template.txt >> template.yml

zip -rq layer.zip nodejs

# No layer building required right now
# npm run package
npm run publish
