import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button} from "@heroui/react";

  export default function NavigationBar() {
    return (
      <Navbar isBordered className="bg-white/70 backdrop-blur-md shadow-md">
        <NavbarBrand>
          <img src="/hit-logo-blue.png" alt="logo" width={36} height={36}/>
        </NavbarBrand>
        <NavbarContent className="sm:flex gap-4" justify="center">
          <NavbarItem className="cursor-pointer" isActive>
            <Link aria-current="page">
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
          <NavbarItem>
            <Button as={Link} color="primary" variant="flat">
              התחבר
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>
    );
  }