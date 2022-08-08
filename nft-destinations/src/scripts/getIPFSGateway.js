export default function getIPFSLink(cid) {
    let text = cid;
    if (!text) return null;
    text = "https://ipfs.io/ipfs/" + text.substring(7);
    return text;
}

