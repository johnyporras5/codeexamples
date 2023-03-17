import React, { useState } from "react";
import IconButton from "@mui/material/IconButton";
import { Box } from "@mui/system";
import Drawer from "@mui/material/Drawer";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";
import IconExpandLess from "@mui/icons-material/ExpandLess";
import IconExpandMore from "@mui/icons-material/ExpandMore";
import MenuIcon from "@mui/icons-material/Menu";
import { isMobile } from "@/interfaces/useDevice";

interface Props {
  showDesktop: boolean;
}

const CustomMenuDrawer = (props: Props): JSX.Element => {
  const [openDrawerAbout, setOpenDrawerAbout] = React.useState(false);
  const [openDrawerWork, setOpenDrawerWork] = React.useState(false);
  const [openDrawerAction, setOpenDrawerAction] = React.useState(false);
  const [openD, setState] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const showDesk = props.showDesktop ? "block" : "none";
  const menuWidth = isMobile ? "80%" : "34%";
  const toggleDrawer = (openD: any) => (event: any) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    //changes the function state according to the value of open
    setState(openD);
  };

  const handleClickLevel = (event: React.MouseEvent<HTMLButtonElement>) => {
    let arrayLists: any = document.getElementsByClassName("ListItem")
  
    
    for (let element of arrayLists) {
        if (element.id == event.currentTarget.id ){
            if (event.currentTarget.style.backgroundColor== ""){
                event.currentTarget.style.backgroundColor = "#3E8941"
            }else{
                event.currentTarget.style.backgroundColor = ""
            }
        }else{ 
            element.style.backgroundColor = ""
       }
    }

   
    
   
    setAnchorEl(event.currentTarget);
    if (event.currentTarget.id === "drawer-about") {
      setOpenDrawerAbout(!openDrawerAbout);
      setOpenDrawerWork(false);
      setOpenDrawerAction(false);
    } else if (event.currentTarget.id === "drawer-work") {
      setOpenDrawerAbout(false);
      setOpenDrawerWork(!openDrawerWork);
      setOpenDrawerAction(false);
    } else if (event.currentTarget.id === "drawer-action") {
      setOpenDrawerAbout(false);
      setOpenDrawerWork(false);
      setOpenDrawerAction(!openDrawerAction);
    }
  };

  return (
    <>
      <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="open drawer"
                    style = {{height:'40px', width:'40px' }}
                    onClick={toggleDrawer(true)}
                    sx={{
                    mr: 2,
                    display: {
                        xs: "block",
                        sm: "block",
                        md: "none",
                        lg:`${ showDesk }`
                    }
                    }}
                >
        <MenuIcon />
      </IconButton>
      <Drawer
        //from which side the drawer slides in
        anchor="right"

        //if open is true --> drawer is shown
        open={openD}
        //function that is called when the drawer should close
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: { width: `${menuWidth}`},
        }}
      >
        {/* The inside of the drawer */}
        <Box
          sx={{
            p: 2,
            height: 1,
            backgroundColor: "#408E44",
            color: "white",
          }}
        >
          {/* when clicking the icon it calls the function toggleDrawer and closes the drawer by setting the variable open to false */}
          <IconButton 
            sx={{ mb: 2 }}
            onClick={toggleDrawer(false)} 
          >
            <CloseIcon style={{color:"white"}}/>
          </IconButton>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ mb: 2 }}>
            <a
              href="https://www.myowf.org/home"
              target="_blank"
              rel="noreferrer"
            >
              <ListItem button>
                <ListItemIcon></ListItemIcon>
              
                <ListItemText primary="Home" />
              </ListItem>
            </a>


            <ListItem
              className="ListItem"
              button
              onClick={(e: any) => handleClickLevel(e)}
              style={{ borderBottom: "1px solid #38813E" }}
              id="drawer-about"
            >
              <ListItemIcon></ListItemIcon>
              <ListItemText primary="About" />
              {openDrawerAbout ? <IconExpandLess/> : <IconExpandMore />}
            </ListItem>
            <Collapse in={openDrawerAbout} timeout="auto" unmountOnExit>
              <Divider />
              <List component="div" disablePadding>
                <a
                  href="https://www.myowf.org/staff"
                  target="_blank"
                  rel="noreferrer"
                >
              
                  <ListItem button>
                    <ListItemText inset>Staff</ListItemText>
                  </ListItem>
                </a>

                <a
                  href="https://www.myowf.org/board"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ListItem button>
                    <ListItemText inset>Board of Directors</ListItemText>
                  </ListItem>
                </a>

                <a
                  href="https://www.sprucegiftsandprovisions.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ListItem button>
                    <ListItemText inset>Spruce Gifts & Provisions</ListItemText>
                  </ListItem>
                </a>

                <a
                  href="https://www.myowf.org/contact-us"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ListItem button>
                    <ListItemText inset>Contact Us</ListItemText>
                  </ListItem>
                </a>

                <a
                  href="https://www.myowf.org/single-post/2021-annual-newsletter"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ListItem button>
                    <ListItemText inset>2021 Annual Newsletter</ListItemText>
                  </ListItem>
                </a>

                <a
                  href="https://www.myowf.org/blog"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ListItem button>
                    <ListItemText inset>Blog</ListItemText>
                  </ListItem>
                </a>

                <a
                  href="https://www.myowf.org/financials"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ListItem button>
                    <ListItemText inset>Financials</ListItemText>
                  </ListItem>
                </a>
              </List>
            </Collapse>

            <ListItem
              button
              className="ListItem"
              onClick={(e: any) => handleClickLevel(e)}
              style={{ borderBottom: "1px solid #38813E" }}
              id="drawer-work"
            >
              <ListItemIcon></ListItemIcon>
              <ListItemText primary="Our Work" />
              {openDrawerWork ? <IconExpandLess /> : <IconExpandMore />}
            </ListItem>
            <Collapse in={openDrawerWork} timeout="auto" unmountOnExit>
              <Divider />
              <List component="div" disablePadding>
                <a
                  href="https://www.myowf.org/sowcc"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ListItem button>
                    <ListItemText inset>SOWCC</ListItemText>
                  </ListItem>
                </a>

                <a
                  href="https://myowf.brand.live/community-conservation"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ListItem button>
                    <ListItemText inset>Community Conservation</ListItemText>
                  </ListItem>
                </a>

                <a
                  href="https://www.myowf.org/fiscal-sponsorship"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ListItem button>
                    <ListItemText inset>
                      Fiscal Sponsorship Program
                    </ListItemText>
                  </ListItem>
                </a>

                <a
                  href="https://www.myowf.org/grants"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ListItem button>
                    <ListItemText inset>Grant Program</ListItemText>
                  </ListItem>
                </a>

                <a
                  href="https://www.myowf.org/notable-accomplishments"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ListItem button>
                    <ListItemText inset>Notable Accomplishments</ListItemText>
                  </ListItem>
                </a>

                <a
                  href="https://www.myowf.org/advised-funds-program"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ListItem button>
                    <ListItemText inset>Advised Funds Program</ListItemText>
                  </ListItem>
                </a>

                <a
                  href="https://www.myowf.org/k9team"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ListItem button>
                    <ListItemText inset>
                      K9 Wildlife Detection Team
                    </ListItemText>
                  </ListItem>
                </a>

                <a
                  href="https://www.myowf.org/_files/ugd/aa665e_6e354fa16046484798688478d1cf2cde.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ListItem button>
                    <ListItemText inset>
                      Migration Safe Fencing Manual
                    </ListItemText>
                  </ListItem>
                </a>
              </List>
            </Collapse>
            <ListItem
              button
              className="ListItem"
              onClick={(e: any) => handleClickLevel(e)}
              style={{ borderBottom: "1px solid #38813E" }}
              id="drawer-action"
            >
              <ListItemIcon></ListItemIcon>
              <ListItemText primary="Take Action" />
              {openDrawerAction ? <IconExpandLess /> : <IconExpandMore />}
            </ListItem>
            <Collapse in={openDrawerAction} timeout="auto" unmountOnExit>
              <Divider />
              <List component="div" disablePadding>
                <a
                  href="https://www.myowf.org/watchforwildlife"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ListItem button>
                    <ListItemText inset>
                      Watch for Wildlife License Plate
                    </ListItemText>
                  </ListItem>
                </a>

                <a
                  href="https://www.myowf.org/membership"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ListItem button>
                    <ListItemText inset>Membership</ListItemText>
                  </ListItem>
                </a>

                <a
                  href="https://www.myowf.org/legacy"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ListItem button>
                    <ListItemText inset>Legacy Society</ListItemText>
                  </ListItem>
                </a>

                <a
                  href="https://www.oregonisalive.org/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ListItem button>
                    <ListItemText inset>OCRF</ListItemText>
                  </ListItem>
                </a>

                <a
                  href="https://fundraise.givesmart.com/e/4wqXfw?vid=txwta"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ListItem button>
                    <ListItemText inset>Across the Arches</ListItemText>
                  </ListItem>
                </a>
              </List>
            </Collapse>

            <a
              href="https://www.myowf.org/donate"
              target="_blank"
              rel="noreferrer"
              >
            <ListItem button>
              <ListItemIcon></ListItemIcon>
              <ListItemText primary="Why Us?" />
            </ListItem>
          </a>


          </Box>
        </Box>
      </Drawer>
    </>
  );
};
export default CustomMenuDrawer;
