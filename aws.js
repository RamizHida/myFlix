const {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
} = require('@aws-sdk/client-s3');

await new AWS.S3({
  credentials: {
    accessKeyId: '<your access key ID>',
    secretAccessKey: '<your secret access key>',
    region: '<your region>',
  },
});

// S3Client.config.update({ region: 'eu-central-1' });

const s3Client = new S3Client();
const listObjectsParams = {
  Bucket: 'my-bucket',
};

// const listObjectsCmd = new ListObjectsV2Command(listObjectsParams);

// s3Client.send(listObjectsCmd);

// app.get('/images', (req, res) => {
//   listObjectsParams = {
//     Bucket: IMAGES_BUCKET,
//   };
// });

// app.get('/images', (req, res) => {});

s3Client
  .send(new ListObjectsV2Command(listObjectsParams))
  .then((listObjectsResponse) => {
    console.log(listObjectsResponse);
    // res.send(listObjectsResponse);
  });
