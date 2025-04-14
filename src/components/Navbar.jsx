import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button} from "@heroui/react";


export const AcmeLogo = () => {
    return (
      <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
        <path
          clipRule="evenodd"
          d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
          fill="currentColor"
          fillRule="evenodd"
        />
      </svg>
    );
  };
  
  export default function NavigationBar() {
    return (
      <Navbar isBordered className="bg-white/70 backdrop-blur-md shadow-md">
        <NavbarBrand>
          <img src="/hit-logo-blue.png" alt="logo" width={36} height={36}/>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem className="cursor-pointer">
            <Link color="foreground">
            ראשי
            </Link>
          </NavbarItem>
          <NavbarItem className="cursor-pointer">
            <Link color="foreground">
              מחשבון
            </Link>
          </NavbarItem>
          <NavbarItem className="cursor-pointer">
            <Link color="foreground">
              אודות
            </Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end">
          <NavbarItem className="cursor-pointer hidden lg:flex">
            <Link>התחבר</Link>
          </NavbarItem>
          <NavbarItem>
            <Button as={Link} color="primary" variant="flat">
              הירשם
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>
    );
  }