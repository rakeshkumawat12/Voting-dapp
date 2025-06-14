import logo from "../assets/logo.png";
import { useWeb3Context } from "../context/web3Context";

const Header = () => {
  const { connectWallet, account, isConnected } = useWeb3Context();

   const shortenAddress = (address) => {
    return `${address.slice(0, 4)}...${address.slice(-3)}`;
  };
  
  return (
    <header className=" inset-x-0 top-0 ">
      <nav
        aria-label="Global"
        className="flex items-center justify-between p-6 lg:px-8"
      >
        <div className="flex lg:flex-1">
          <a href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Voting dapp</span>
            <img alt="" src={logo} className="h-12 w-auto" />
          </a>
        </div>

        <div className="lg:flex lg:flex-1 lg:justify-end">
          <button
            onClick={connectWallet}
            className="text-sm/6 font-semibold text-white cursor-pointer rounded-2xl bg-[#e6007bbe] p-2"
          >
            {isConnected ? shortenAddress(account?.address) : "Connect Talisman Wallet"}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
