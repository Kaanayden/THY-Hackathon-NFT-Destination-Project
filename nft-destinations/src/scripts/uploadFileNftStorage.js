const nftStorageApiKey = process.env.REACT_APP_NFT_STORAGE_API_KEY;

export default async function uploadFileNftStorage(data) {



    const form = new FormData();
    form.append('file', data);

    let result = await fetch('https://api.nft.storage/upload', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer ' + nftStorageApiKey,
        },
        body: form
    });


    let jsonData = await result.json();

    jsonData.ipfsGatewayUrl = "ipfs://" + jsonData.value.cid + "/" + jsonData.value.files[0].name;
    jsonData.ipfsPublicGatewayUrl = "https://ipfs.io/ipfs/" + jsonData.value.cid + "/" + jsonData.value.files[0].name;
    return jsonData;
}