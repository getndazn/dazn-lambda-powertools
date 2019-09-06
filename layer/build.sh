cd nodejs

echo 'installing DAZN powertools'
npm install @dazn/lambda-powertools-correlation-ids
npm install @dazn/lambda-powertools-firehose-client
npm install @dazn/lambda-powertools-http-client
npm install @dazn/lambda-powertools-kinesis-client
npm install @dazn/lambda-powertools-lambda-client
npm install @dazn/lambda-powertools-logger
npm install @dazn/lambda-powertools-middleware-correlation-ids
npm install @dazn/lambda-powertools-middleware-log-timeout
npm install @dazn/lambda-powertools-middleware-obfuscater
npm install @dazn/lambda-powertools-middleware-sample-logging
npm install @dazn/lambda-powertools-middleware-stop-infinite-loop
npm install @dazn/lambda-powertools-pattern-basic
npm install @dazn/lambda-powertools-pattern-obfuscate
npm install @dazn/lambda-powertools-sns-client
npm install @dazn/lambda-powertools-sqs-client
npm install @dazn/lambda-powertools-step-functions-client

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

npm run package
npm run publish
