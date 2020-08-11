import { DocumentClient as awsDocumentClient } from "aws-sdk/clients/dynamodb";
import { AWSError } from "aws-sdk/lib/error";
import { Request } from "aws-sdk/lib/request";
import CorrelationIds from "@dazn/lambda-powertools-correlation-ids";

declare const DocumentClient: awsDocumentClient & {
  putWithCorrelationIds(
    correlationId: CorrelationIds,
    params: awsDocumentClient.PutItemInput,
    callback?: (err: AWSError, data: awsDocumentClient.PutItemOutput) => void
  ): Request<awsDocumentClient.PutItemOutput, AWSError>;
  updateWithCorrelationIds(
    correlationId: CorrelationIds,
    params: awsDocumentClient.UpdateItemInput,
    callback?: (err: AWSError, data: awsDocumentClient.UpdateItemOutput) => void
  ): Request<awsDocumentClient.UpdateItemOutput, AWSError>;
  batchWriteWithCorrelationIds(
    correlationId: CorrelationIds,
    params: awsDocumentClient.BatchWriteItemInput,
    callback?: (
      err: AWSError,
      data: awsDocumentClient.BatchWriteItemOutput
    ) => void
  ): Request<awsDocumentClient.BatchWriteItemOutput, AWSError>;
  transactWriteWithCorrelationIds(
    correlationId: CorrelationIds,
    params: awsDocumentClient.TransactWriteItemsInput,
    callback?: (
      err: AWSError,
      data: awsDocumentClient.TransactWriteItemsOutput
    ) => void
  ): Request<awsDocumentClient.TransactWriteItemsOutput, AWSError>;
};
export default DocumentClient;
