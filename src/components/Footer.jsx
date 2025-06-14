import logo from "../assets/logo.png"

const Footer = () => {
  return (
    <footer className="bg-white pb-4 dark:bg-transparent">
      <div className="mx-auto max-w-5xl px-6">
        <div href="/" aria-label="go home" className="mx-auto block size-fit">
          <img className="size-8 h-16 w-auto" src={logo}/>
        </div>

        <span className="text-caption block text-center text-sm">
          © 2025 Voting dapp, All rights reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
