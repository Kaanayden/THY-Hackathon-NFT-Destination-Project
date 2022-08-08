import React, { useState, useEffect } from "react";
import Globe from 'react-globe.gl';
import contractAddress from "contracts/contractAddress.json";
import { useMoralis, useNFTBalances, useMoralisWeb3Api } from "react-moralis";
import { useVerifyMetadata } from "hooks/useVerifyMetadata";
import NFTPreview from "./NFTPreview";
import FlipFlapAlpha from "components/NFTCard/FlipFlapAlpha";
import DestinationNumber from "components/NFTCard/DestinationNumber";
import { Col, Row } from 'antd'



export default function OnlyMap(props) {
    const [countries, setCountries] = useState({ features: [] });
    const [allNFTs, setAllNFTs] = useState(null);
    const { Moralis, chainId, account } = useMoralis();
    const [cardElements, setCardElements] = useState([]);

    const { verifyMetadata } = useVerifyMetadata();
    const Web3Api = useMoralisWeb3Api();

    useEffect(() => {
        // load data
        fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson').then(res => res.json()).then(setCountries);

        let noRefresh = 0;

        const interval = setInterval(() => {
            noRefresh++;
            if (noRefresh < 2) {
                fetchNFTss().then((metadataNFTs) => {

                    setAllNFTs(metadataNFTs)


                });
            }
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const generateDeterministicColor = () => {
        for (let i = 0; i < countries.features.length; i++) {
            countries.features[i].colorr = Math.round(countries.features[i].properties.POP_EST / 162436 % 1 * Math.pow(2, 24)).toString(16).padStart(6, '0')
        }
    }
    generateDeterministicColor();

    const fetchNFTss = async () => {
        let nfts = await Web3Api.token.getNFTOwners({
            chain: "rinkeby",
            address: contractAddress.address
        });

        let metadataNFTs = nfts.result.map((nft) => {

            let newNft = verifyMetadata(nft);
            return newNft;



        });

        return (metadataNFTs);
    }

    function setLatAndLng(nfts) {
        return nfts.map((nft) => {
            console.log(nft.metadata)
            try {
                nft.metadata = JSON.parse(nft.metadata)
            } catch (err) {
                console.log(err)
            }

            nft.metadata.lat = nft.metadata.attributes[1].value;
            nft.metadata.lng = nft.metadata.attributes[2].value;
            nft.metadata.token_address = nft.token_address;
            nft.metadata.token_id = nft.token_id;
            nft.metadata.nft = nft;
            return nft.metadata;
        })
    }

    let onlyWithMetadataNfts = [];
    if (allNFTs) {
        allNFTs.forEach((nft) => {
            if (nft.metadata) {
                onlyWithMetadataNfts.push(nft);

            }
        });
    }

    onlyWithMetadataNfts = setLatAndLng(onlyWithMetadataNfts);



    const handleLabelHover = (label) => {
        console.log("label", label);
        if (label) {
            let element = label;
            console.log("hey1");
            element.htmlInfo = <NFTPreview nft={label} />
            let elemen = <NFTPreview nft={label} />;
            elemen.type()
            console.log("hey2");
            let newArray = [];
            newArray.push(element);
            console.log(newArray);
            setCardElements(newArray);
        }

    };
    console.log("cardElements", cardElements)
    return (
        <div>

            <Row justify="center">
                <Col span={24}>
                    <DestinationNumber number={onlyWithMetadataNfts.length} />
                </Col>

            </Row>

            <Row justify="center">

                <Col span={24}><FlipFlapAlpha text={"DESTINATIONS"} /></Col>

            </Row>

            <Row justify="center">

                <Col span={24}>
                    <Globe

                        width={800}
                        className="earth"
                        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"

                        hexPolygonsData={countries.features}
                        hexPolygonResolution={3}
                        hexPolygonMargin={0.3}
                        hexPolygonColor={"colorr"}

                        labelsData={onlyWithMetadataNfts}
                        labelText="name"
                        labelSize={1.5}
                        labelDotRadius={1.1}
                        labelColor={() => 'rgba(255, 255, 255, 0.95)'}
                        labelResolution={2}
                        labelAltitude={0.01}
                        onLabelHover={(label) => handleLabelHover(label)}

                        htmlElementsData={cardElements}
                        htmlLat={"lat"}
                        htmlLng={"lng"}
                        htmlElement={
                            d => {
                                const el = document.createElement('div');
                                el.innerHTML =
                                    `<svg viewBox="-4 0 36 36">
                                <path fill="currentColor" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"></path>
                                <circle fill="black" cx="14" cy="14" r="7"></circle>
                                </svg>`;
                                //el.style.color = d.color;
                                el.style.width = `100px`;

                                el.style['pointer-events'] = 'auto';
                                el.style.cursor = 'pointer';
                                el.onclick = () => window.open("https://testnets.opensea.io/assets/rinkeby/" + contractAddress.address + "/" + d.token_id);
                                return el;
                            }
                        }
                    />
                </Col>

            </Row>

        </div>
    );
}