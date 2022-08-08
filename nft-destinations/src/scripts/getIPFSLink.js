export default function getIPFSGateway(cid) {
    let text = cid;
    if (!text) return null;
    text = "https://nftstorage.link/ipfs/" + text.substring(7);

    return text;
}

