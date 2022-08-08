import { useLocation } from "react-router";
import { Menu } from "antd";
import { NavLink } from "react-router-dom";
import { RiAdminLine } from "react-icons/ri";

function MenuItems() {
  const { pathname } = useLocation();

  return (
    <Menu
      theme="light"
      mode="horizontal"
      style={{
        display: "flex",
        fontSize: "17px",
        fontWeight: "500",
        width: "100%",
        justifyContent: "left",
      }}
      defaultSelectedKeys={[pathname]}
    >

      <Menu.Item key="/nftBalance">
        <NavLink to="/nftBalance">
          🖼 NFTs
        </NavLink>
      </Menu.Item>
      <Menu.Item key="/map">
        <NavLink to="/map">
          🌎 Map
        </NavLink>
      </Menu.Item>
      <Menu.Item key="/admin">
        <NavLink to="/admin">
          <RiAdminLine /> Admin
        </NavLink>
      </Menu.Item>
    </Menu>
  );
}

export default MenuItems;
