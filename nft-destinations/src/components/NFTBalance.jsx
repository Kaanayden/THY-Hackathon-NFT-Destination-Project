import React, { useEffect, useState } from "react";
import { useMoralis, useNFTBalances, useMoralisWeb3Api } from "react-moralis";
import { Card, Image, Tooltip, Modal, Input, Skeleton, Typography, Menu } from "antd";
import {
  FileSearchOutlined,
  SendOutlined,
  ShoppingCartOutlined,
  UserOutlined,

} from "@ant-design/icons";
import { getExplorer } from "helpers/networks";
import AddressInput from "./AddressInput";
import { useVerifyMetadata } from "hooks/useVerifyMetadata";
import DestinationNumber from "./NFTCard/DestinationNumber";
import { FaPlaneDeparture } from "react-icons/fa";
import contractAddress from "contracts/contractAddress.json";
import FlipFlapAlpha from "./NFTCard/FlipFlapAlpha";
import getIPFSGateway from "scripts/getIPFSGateway";
const { Meta } = Card;
const { Text } = Typography;

const styles = {
  NFTs: {
    display: "flex",
    flexWrap: "wrap",
    WebkitBoxPack: "start",
    justifyContent: "flex-start",
    margin: "0 auto",
    maxWidth: "1200px",
    width: "100%",
    gap: "10px",
  },
};

function NFTBalance() {
  const { data: NFTBalances } = useNFTBalances();
  const { Moralis, chainId, account } = useMoralis();
  const [visible, setVisibility] = useState(false);
  const [receiverToSend, setReceiver] = useState(null);
  const [amountToSend, setAmount] = useState(null);
  const [nftToSend, setNftToSend] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const { verifyMetadata } = useVerifyMetadata();
  const [selectedMenu, setSelectedMenu] = useState('all');
  const [userNFTs, setUserNFTs] = useState();
  const [allNFTs, setAllNFTs] = useState();


  const Web3Api = useMoralisWeb3Api();
  /*
    const fetchNFTMetadata = async () => {
      const options = {
        address: "0xe986bbe764b82364c06eb6542b2d158a7832f93b",
        chain: "rinkeby",
      };
      const metaData = await Web3Api.token.getNFTMetadata(options);
      console.log(metaData);
    };
  */


  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedMenu == "all") {
        Web3Api.token.getNFTOwners({
          chain: "rinkeby",
          address: contractAddress.address
        })
          .then((data) => {
            console.log("denemedir", data)
            setAllNFTs(data);
          })

      } else if (selectedMenu == "user") {
        Web3Api.account.getNFTsForContract({
          chain: "rinkeby",
          token_address: contractAddress.address,
        })
          .then((data) => {
            setUserNFTs(data);
          });
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);


  async function transfer(nft, amount, receiver) {
    console.log(nft, amount, receiver);
    const options = {
      type: nft?.contract_type?.toLowerCase(),
      tokenId: nft?.token_id,
      receiver,
      contractAddress: nft?.token_address,
    };

    if (options.type === "erc1155") {
      options.amount = amount ?? nft.amount;
    }

    setIsPending(true);

    try {
      const tx = await Moralis.transfer(options);
      console.log(tx);
      setIsPending(false);
    } catch (e) {
      alert(e.message);
      setIsPending(false);
    }
  }

  const handleTransferClick = (nft) => {
    setNftToSend(nft);
    setVisibility(true);
  };

  const handleChange = (e) => {
    setAmount(e.target.value);
  };

  const handleMenuChange = (e) => {
    if (e.key == "user") {
      Web3Api.account.getNFTsForContract({
        chain: "rinkeby",
        token_address: contractAddress.address,
      })
        .then((data) => {
          setUserNFTs(data);
        });
    } else {
      Web3Api.token.getNFTOwners({
        chain: "rinkeby",
        address: contractAddress.address
      })
        .then((data) => {
          console.log("denemedir", data)
          setAllNFTs(data);
        })

    }
    setSelectedMenu(e.key);
  };

  function handlePromotion() {
    let tarih = new Date();
    let dayRandom = tarih.getDay() * tarih.getFullYear() * tarih.getMonth();
    let promotion = Math.floor(dayRandom * 100000000 % 5122535).toString();
    alert("Bu lokasyona ücretsiz uçmak için bugünkü promosyon kodunuz: " + promotion);
  }

  let NFTElements;
  let count = 0;
  if (selectedMenu == "all") {
    if (allNFTs) {

      NFTElements = allNFTs.result.map((nft, index) => {

        //Verify Metadata
        try {
          nft = verifyMetadata(nft);
          nft.metadata = JSON.parse(nft.metadata)
        } catch (err) {
          console.log(err);
        }
        console.log(nft);
        console.log("test", getIPFSGateway(nft?.metadata.image))
        if (nft.metadata) {

          count++;

          let actions;
          if (nft.owner_of == account) {
            actions = [
              <Tooltip title="Blockchain Tarayıcısında Görüntüle">
                <FileSearchOutlined
                  onClick={() =>
                    window.open(
                      `${getExplorer(chainId)}address/${nft.token_address
                      }`
                    )
                  }
                />
              </Tooltip>,
              <Tooltip title="NFT'yi Transfer Et">
                <SendOutlined onClick={() => handleTransferClick(nft)} />
              </Tooltip>,
              <Tooltip title="OpenSea'de görüntüle">
                <ShoppingCartOutlined
                  onClick={() => window.open("https://testnets.opensea.io/assets/rinkeby/" + contractAddress.address + "/" + nft.token_id)}
                />
              </Tooltip>,
              <Tooltip title="Bedava Uçuş Kodunu Al">
                <FaPlaneDeparture
                  onClick={handlePromotion}
                />
              </Tooltip>,
            ];
          } else {
            actions = [
              <Tooltip title="Blockchain Tarayıcısında Görüntüle">
                <FileSearchOutlined
                  onClick={() =>
                    window.open(
                      `${getExplorer(chainId)}address/${nft.token_address
                      }`,

                    )
                  }
                />
              </Tooltip>,
              <Tooltip title="OpenSea'de Görüntüle">
                <ShoppingCartOutlined
                  onClick={() => window.open("https://testnets.opensea.io/assets/rinkeby/" + contractAddress.address + "/" + nft.token_id)}
                />
              </Tooltip>,
            ];
          }

          return (
            <Card
              hoverable
              actions={actions}
              style={{ width: 360, border: "2px solid #e7eaf3" }}
              cover={
                <Image
                  preview={false}
                  src={getIPFSGateway(nft?.metadata.image) || "error"}
                  fallback="data:image/png;base64,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"
                  alt=""
                  style={{ height: "300px" }}
                />
              }
              key={index}
            >
              {nft.owner_of != account && <Text type="warning">{"Sahibi: " + nft.owner_of}</Text>}
              {nft.owner_of == account && <Text type="success">{"Sahibi: Siz"}</Text>}
              <Meta title={nft.metadata.name} description={nft.metadata.description} />


            </Card>
          );
        }

      });

    }
  } else {
    if (userNFTs) {
      NFTElements = userNFTs.result.map((nft, index) => {

        //Verify Metadata

        try {

          nft = verifyMetadata(nft);
          nft.metadata = JSON.parse(nft.metadata)
        } catch (err) {
          console.log(err);
        }
        console.log("test", getIPFSGateway(nft?.metadata.image))
        console.log(nft);
        if (nft.metadata) {

          count++;
          let actions;
          if (nft.owner_of == account) {
            actions = [
              <Tooltip title="Blockchain Tarayıcısında Görüntüle">
                <FileSearchOutlined
                  onClick={() =>
                    window.open(
                      `${getExplorer(chainId)}address/${nft.token_address
                      }`,
                      "_blank",
                    )
                  }
                />
              </Tooltip>,
              <Tooltip title="NFT'yi Transfer Et">
                <SendOutlined onClick={() => handleTransferClick(nft)} />
              </Tooltip>,
              <Tooltip title="OpenSea'de Görüntüle">
                <ShoppingCartOutlined
                  onClick={() => window.open("https://testnets.opensea.io/assets/rinkeby/" + contractAddress.address + "/" + nft.token_id)}
                />
              </Tooltip>,
              <Tooltip title="Bedava Uçuş Kodunu Al">
                <FaPlaneDeparture
                  onClick={handlePromotion}
                />
              </Tooltip>,
            ];
          } else {
            actions = [
              <Tooltip title="Blockchain Tarayıcısında Görüntüle">
                <FileSearchOutlined
                  onClick={() =>
                    window.open(
                      `${getExplorer(chainId)}address/${nft.token_address
                      }`,
                      "_blank",
                    )
                  }
                />
              </Tooltip>,
              <Tooltip title="OpenSea'de Görüntüle">
                <ShoppingCartOutlined
                  onClick={() => window.open("https://testnets.opensea.io/assets/rinkeby/" + contractAddress.address + "/" + nft.token_id)}
                />
              </Tooltip>,
            ];
          }

          return (
            <Card
              hoverable
              actions={actions}
              style={{ width: 360, border: "2px solid #e7eaf3" }}
              cover={
                <Image
                  preview={false}
                  src={getIPFSGateway(nft?.metadata.image) || "error"}
                  fallback="data:image/png;base64,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"
                  alt=""
                  style={{ height: "300px" }}
                />
              }
              key={index}
            >
              {nft.owner_of != account && <Text type="warning">{"Sahibi: " + nft.owner_of}</Text>}
              {nft.owner_of == account && <Text type="success">{"Sahibi: Siz"}</Text>}
              <Meta title={nft.metadata.name} description={nft.metadata.description} />


            </Card>
          );
        }

      });
    }

  }

  return (
    <div style={{ padding: "15px", maxWidth: "1200px", width: "100%" }}>
      <Menu defaultSelectedKeys={['all']} mode="horizontal" onClick={handleMenuChange}>
        <Menu.Item key="all" icon={<FaPlaneDeparture />}>
          Bütün NFT'ler
        </Menu.Item>
        <Menu.Item key="user" icon={<UserOutlined />}>
          NFT'leriniz
        </Menu.Item>
      </Menu>
      <div>
        <DestinationNumber number={count} />
        <FlipFlapAlpha text={"DESTINATIONS"} />
      </div>
      <div style={styles.NFTs}>
        <Skeleton loading={count == 0}>
          {NFTElements}
        </Skeleton>
      </div>
      <Modal
        title={`Transfer ${nftToSend?.name || "NFT"}`}
        visible={visible}
        onCancel={() => setVisibility(false)}
        onOk={() => {
          transfer(nftToSend, amountToSend, receiverToSend);
          setVisibility(false);
        }}
        confirmLoading={isPending}
        okText="Send"
      >
        <AddressInput autoFocus placeholder="Receiver" onChange={setReceiver} />
        {nftToSend && nftToSend.contract_type === "erc1155" && (
          <Input
            placeholder="amount to send"
            onChange={(e) => handleChange(e)}
          />
        )}
      </Modal>
    </div>
  );





}

export default NFTBalance;
