
import React, { useState } from 'react'
import { Input, Upload, message, Button, Alert, Typography, Spin, Result, Modal, notification, InputNumber } from 'antd';
import { LoadingOutlined, PlusOutlined, UploadOutlined, FileImageOutlined, SaveOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import uploadFileNftStorage from 'scripts/uploadFileNftStorage';
import getIPFSLink from 'scripts/getIPFSLink';
import uploadData from 'scripts/uploadData';

import contracts from 'contracts/contractAddress'
const contractAddress = contracts.address;
import abi from 'contracts/abi'
import { useMoralis, useChain, useMoralisWeb3Api } from 'react-moralis';


const { TextArea } = Input;

const { Text, Link, Title } = Typography;

const externalUrl = "https://nft-destinations.kaanaydeniz.com/map"
const description = "NFT Destinations Projesi"

const NFTMetadataGenerator = (data) => {
    let metadata = {};

    metadata.name = data.name;
    metadata.description = description;
    metadata.image = data.imageFileUrl;
    metadata.external_url = externalUrl
    metadata.attributes = []
    metadata.attributes[0] = {
        trait_type: "Continent",
        value: data.continent
    }
    metadata.attributes[1] = {
        display_type: "number",
        trait_type: "Latitude",
        value: data.latitude
    }
    metadata.attributes[2] = {
        display_type: "number",
        trait_type: "Longtitude",
        value: data.longtitude
    }

    return metadata;
}

export default function Admin(props) {

    const { Moralis } = useMoralis();
    const { switchNetwork, chainId, chain, account } = useChain();
    const Web3Api = useMoralisWeb3Api();
    //onFinish prop

    const submitNft = async () => {

        let output = await Moralis.executeFunction(
            {
                contractAddress: contractAddress,
                functionName: "safeMint",
                abi: abi,
                params: {
                    to: account,
                    uri: result.ipfsGatewayUrl
                }
            }
        )
        console.log(output);

        setTimeout(() => {
            notification.open({
                message: 'NFT Üretimi',
                description:
                    'NFT Başarıyla Üretildi!',
                icon: <CheckCircleOutlined style={{ color: "green" }} />,
            });

        }, 1000)

    }





    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState();
    const [pending, setPending] = useState(false);
    const [imageUrl, setImageUrl] = useState();




    const [imageIpfs, setImageIpfs] = useState();
    const [audioIpfs, setAudioIpfs] = useState();
    const [name, setName] = useState();
    const [latitude, setLatitude] = useState();
    const [longtitude, setLongtitude] = useState();
    const [continent, setContinent] = useState();

    const [isImageUploading, setImageUploading] = useState(false);
    const [result, setResult] = useState();


    const uploadButton = (
        <div>
            {loading ? <LoadingOutlined /> : <FileImageOutlined />}
            <div
                style={{
                    marginTop: 8,
                }}
            >
                Resim Yükle
            </div>
        </div>
    );

    const handleNameChange = (e) => {
        setName(e.target.value);
    }



    const handleChange = async (e) => {
        let file = e.file.originFileObj
        console.log(file);
        setImage(file);
        setImageUrl(URL.createObjectURL(file))
        setImageUploading(true);
        let result = await uploadFileNftStorage(file);
        setImageUploading(false);
        setImageIpfs(result);

    }




    const handleClick = async () => {
        let data = {};
        data.name = name;
        data.imageFileUrl = imageIpfs.ipfsGatewayUrl;
        data.continent = continent;
        data.latitude = latitude;
        data.longtitude = longtitude;
        let metadata = NFTMetadataGenerator(data);
        console.log(metadata)
        console.log(JSON.stringify(metadata))
        setPending(true);
        let result = await uploadData(JSON.stringify(metadata));
        console.log(result)
        setResult(result);
    }





    return (
        <>
            <div>
                <Title>Merkezsiz NFT Üretimi</Title>
                <Alert message="Yalnızca yönetici yeni NFT oluşturabilir." type="warning" />
                {

                    !result &&
                    <Spin
                        spinning={pending}
                        tip={"Veri IPFS'e (merkezsiz veri yapısı) yükleniyor..."}
                    >
                        <Input
                            placeholder="İsim"
                            //addonBefore="Name"
                            size="large"
                            onChange={handleNameChange}
                        />
                        <InputNumber
                            placeholder="Latitude"
                            //addonBefore="Name"
                            size="large"
                            onChange={(e) => setLatitude(e)}
                        />
                        <InputNumber
                            placeholder="Longtitude"
                            //addonBefore="Name"
                            size="large"
                            onChange={(e) => setLongtitude(e)}
                        />
                        <Input
                            placeholder="Kıta"
                            //addonBefore="Name"
                            size="large"
                            onChange={(e) => setContinent(e.target.value)}
                        />


                        <Spin tip="Veri IPFS'e (merkezsiz veri yapısı) yükleniyor..." spinning={isImageUploading}>
                            <Upload
                                name="image"
                                listType="picture-card"
                                className="avatar-uploader"
                                showUploadList={false}
                                onChange={handleChange}
                            >
                                {image ? (
                                    <img

                                        src={imageUrl}
                                        alt="Image"
                                        style={{
                                            width: '100%',
                                        }}
                                    />
                                ) : (
                                    uploadButton
                                )}
                            </Upload>
                        </Spin>
                        {imageIpfs &&
                            <Alert message={

                                <Link href={imageIpfs.ipfsPublicGatewayUrl} target="_blank">
                                    Veri başarıyla IPFS'e yüklendi
                                </Link>
                            } type="success" />

                        }

                        <div>




                        </div>

                        <Button type="primary" shape="round" icon={<SaveOutlined />} size="large"
                            disabled={!(name && imageIpfs && latitude && longtitude && continent)}
                            onClick={handleClick}
                        >
                            NFT Üret
                        </Button>
                    </Spin>
                }

                {result &&
                    <Result
                        status="success"
                        title="NFT Verileri IPFS'e Başarıyla Kaydedildi!"
                        subTitle={
                            <div>
                                <Text type="secondary">NFT verileri IPFS'e kaydedildi </Text>

                                <Link href={getIPFSLink(result.value.url)} target="_blank">
                                    Buraya tıklayarak verileri görüntüleyebilirsiniz.
                                </Link>
                            </div>

                        }
                        extra={[
                            <Button type="primary" key="console" icon={<SaveOutlined />}
                                onClick={submitNft}
                            >
                                Ethereum Blokzincirine Kaydet
                            </Button>
                        ]}
                    />

                }

            </div>

        </>

    )
}