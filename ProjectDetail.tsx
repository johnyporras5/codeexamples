import React, { useState, useEffect } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import { Box } from "@mui/system";
import { Button, Grid } from "@mui/material";
import { green, grey } from "@mui/material/colors";
import { styled } from "@mui/material/styles";
import { ButtonProps } from "@mui/material/Button";
import { AspectRatio } from "react-aspect-ratio";
import Menu from "@mui/material/Menu";
import MenuItem, { MenuItemProps } from "@mui/material/MenuItem";
import Drawer from "@mui/material/Drawer";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText, { ListItemTextProps } from "@mui/material/ListItemText";

import MenuIcon from "@mui/icons-material/Menu";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Collapse from "@mui/material/Collapse";

import IconExpandLess from "@mui/icons-material/ExpandLess";
import IconExpandMore from "@mui/icons-material/ExpandMore";
import Carousel from 'react-material-ui-carousel'
import CustomMenuDrawer from "../MenuDrawer/MenuDrawer";
import { isMobile } from "@/interfaces/useDevice";
import Footer from '@/components/Footer/Footer'
import SocialMedia from '@/components/SocialMedia/SocialMedia'
import { Paper } from '@mui/material'

import {
    Card,
    CardMedia
} from '@mui/material';



type Item = {
    contentPosition: "left" | "right" | "middle",
    imgs: []
}

interface BannerProps
{
    item: Item,
    contentPosition: "left" | "right" | "middle",
    length?: number,

}






interface Props {
  projectTitle: string;
}

interface IContainerWidth {
  width: number | string;
}

const svgIcon = (
  <Icon>
    <img src={"/instagram.png"} alt="Instagram" />
  </Icon>
);

const GreenButton = styled(Button)<ButtonProps>(({ theme }) => ({
  backgroundColor: green[500],
  "&:hover": {
    backgroundColor: green[700],
  },
  borderRadius: "0px",
  marginLeft: "1em",
  padding: "3px 10px 3px 10px",
  color: "white",
  border: "1px solid grey",
  width: "121px",
  height: "35px",
  marginTop: "10px",
  fontSize:"16px",
  fontFamily:"Arial,Helvetica,sans-serif"

}));

const BlackButton = styled(Button)<ButtonProps>(({ theme }) => ({
  borderRadius: "0px",
  color: "black",
  "&:hover": {
    backgroundColor: "#E4E0D8",
    color: "black",
  },
  fontWeight: "bold",
  margin: "0em 2em 0em 2em",
  fontFamily:"Arial,Helvetica,sans-serif"
}));

const LightGreenButton = styled(Button)<ButtonProps>(({ theme }) => ({
  backgroundColor: "#86B5AE",
  "&:hover": {
    backgroundColor: "#86B5AE",
    color: "black",
  },
  color: "black",
  fontWeight: "bold",
  padding: "7px 40px 7px 40px",
  border: "1px solid grey",
  borderRadius: "15px",
  width: "15em",
}));

const CustomizedMenuItem = styled(MenuItem)<MenuItemProps>(({ theme }) => ({
  backgroundColor: "#515050",
  "&:hover": {
    backgroundColor: "black",
  },
  border: "1px solid #BEC3A1",
  width: "300px",
  justifyContent: "flex-end",
}));

const CustomizedMenuItemText = styled(ListItemText)<ListItemTextProps>(
  ({ theme }) => ({
    textAlign: "center",
    color: "white",
    fontWeight: "bolder",
  })
);

const timeoutLength = 500;

interface IButtonMenuMapping {
  [key: string]: string;
}



const ProjectDetail = (props: Props) => {
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [banner, setBanner] = useState("");
  const [defaultImage, setDefaultImage] = useState(false);
  const [milestones, setMilestones] = useState("");
  const [photos, setPhotos] = useState("");
  const [events, setEvents] = useState("");
  const [pdfs, setPdfs] = useState("");
  const [links, setLinks] = useState("");
  const [linksy, setLinksy] = useState("");
  const [daterange, setDaterange] = useState("");
  const [dateongoing, setDateongoing] = useState("");
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [openDrawerAbout, setOpenDrawerAbout] = React.useState(false);
  const [openDrawerWork, setOpenDrawerWork] = React.useState(false);
  const [openDrawerAction, setOpenDrawerAction] = React.useState(false);

  const [menuIdOpen, setMenuIdOpen] = React.useState<string>("");
  
  


  const buttonMenuMapping: IButtonMenuMapping = {
    "basic-button-about": "basic-menu-about",
    "basic-button-action": "basic-menu-action",
    "basic-button-work": "basic-menu-work",
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const elementId = e?.currentTarget?.id;
    setMenuIdOpen(elementId);
    setAnchorEl(e.currentTarget);
  };

  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    const elementId = e?.currentTarget?.id;
    setMenuIdOpen(elementId);
  };

  const enterButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    const elementId = e?.currentTarget?.id;
    setMenuIdOpen(elementId);
    setAnchorEl(e.currentTarget);
  };

  const leaveButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    const elementId = e?.currentTarget?.id;
    const menu: any = document.getElementById(buttonMenuMapping[elementId])
      ?.children[2];
    if (e.currentTarget.localName !== "ul" && menu) {
      const menuBoundary = {
        left: menu.offsetLeft,
        top: e.currentTarget.offsetTop + e.currentTarget.offsetHeight,
        right: menu.offsetLeft + menu.offsetHeight,
        bottom: menu.offsetTop + menu.offsetHeight,
      };
      if (
        e.clientX >= menuBoundary.left &&
        e.clientX <= menuBoundary.right &&
        e.clientY <= menuBoundary.bottom &&
        e.clientY >= menuBoundary.top
      ) {
        return;
      }
    }
    setMenuIdOpen("");
  };

  const leaveMenu = () => {
    setMenuIdOpen("");
  };

  const [openD, setState] = useState(false);

  //function that is being called every time the drawer should open or close, the keys tab and shift are excluded so the user can focus between the elements with the keys
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

  //dynamically controls filter width at mobile depending on screen size and # of categories
  useEffect(() => {
    let localBanner = localStorage.getItem("banner")?.replace(/^\s+|\s+$/gm,'');
    if (localBanner==""){
      localBanner = "/default.png"
      setDefaultImage(true)
      
    }
    
    setTitle(localStorage.getItem("title") || "");
    setBanner(localBanner || "");
    setDescription(localStorage.getItem("description") || "");
    setMilestones(localStorage.getItem("milestones") || "");
    setEvents(localStorage.getItem("events") || "");
    setPhotos(localStorage.getItem("photos") || "");
    setPdfs(localStorage.getItem("pdfs") || "");
    setLinks(localStorage.getItem("links") || "");
    setDaterange(localStorage.getItem("dateRange") || "");
    setDateongoing(localStorage.getItem("dateOngoing") || "");
    setLinksy(localStorage.getItem("linksY") || "");


  });

  const handleClickLevel = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log(event.currentTarget.id);
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
  
  const isMobileResponsive = useMediaQuery('(max-width:600px)');
  const packPhotos = ()=>{
    let items_photos=[];
    let images:any = []
    let _photos = photos ? JSON.parse(photos) : [];
    for (let i=0;i<_photos.length;i++){
      images.push(_photos[i])
      if (((i+1)%3==0 || i==_photos.length-1) && !isMobileResponsive){
        items_photos.push({'imgs':images})
        images=[]
      }else if (isMobileResponsive){
        items_photos.push({'imgs':images})
        images=[]
      }
    }
    // console.log(items_photos)
    return items_photos
  }

  const Banner = (props: BannerProps) => {
    let items = [];
    //@ts-ignore
    const cardSize = props.item.imgs.length == 2 ? 6 : 4

    for (let i = 0; i < props.item.imgs.length; i++) {
      const item = props.item.imgs[i];

      const media = (
          <Grid item xs={isMobileResponsive ? 12 : cardSize}>
              <CardMedia
                  className="Media"
                  image={item}
              >
              </CardMedia>

          </Grid>
      )

      items.push(media);
    }

 

  return (
      <Card raised className="Banner">
          <Grid container spacing={0} className="BannerGrid">
              {items}
          </Grid>
      </Card>
  )
}
  
  return (
    <>
      <Grid
        container
        direction="column"
        justifyContent="flex-start"
        padding="1em"
        
      >
        <Grid item container>
          <Box display="flex" flexDirection="column" width="100%">
            <div className="mainHeader">
              <div id="myflex1">
                <div className="mainLogo">
                  <Box width="100%">
                    <img
                      src={"/OWFLogoBlue.png"}
                      alt="Main Logo"
                      width={"100%"}
                    />
                  </Box>
                  <Box fontWeight={"bold"} color={"#2a4251"} paddingLeft={"5px"}>
                    Funding statewide conservation since 1981
                  </Box>
                </div>
              </div>
              <div id="myflex">
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                  alignItems="flex-end"
                >
                  <div className="mainButtons">
                <div className="socialMedia">
                    <SocialMedia/>
                 </div>
                    <Box
                      display="flex"
                      flexDirection="row"
                      marginBottom={"1em"}
                      marginRight={"2.5em"}
                      className="socialMediaMenu"
                    >
                      <GreenButton>
                        <a
                          href="https://fundraise.givesmart.com/form/4JCecw?vid=txw85"
                          target="_blank"
                          rel="noreferrer"
                        >
                          DONATE
                        </a>
                      </GreenButton>
                      <GreenButton>
                        <a
                          href="https://myowf.us4.list-manage.com/subscribe?u=d79dd06d49e3650c1666a36e0&id=c79360edc1"
                          target="_blank"
                          rel="noreferrer"
                        >
                          NEWSLETTER
                        </a>
                      </GreenButton>
                    </Box>
                  </div>

                  <Box display="flex" flexDirection="row">
                    <div className="drawerMenu">
                      <CustomMenuDrawer showDesktop={false} />
                    </div>
                    {!isMobile && (
                      <div
                        className="mainMenu"
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "end",
                          marginRight:'15px',
                          border: "0px solid black"
                        }}
                      >
                        <div className="menuOption">
                          <BlackButton style={{ zIndex: 1301 , marginLeft:"12px", fontSize:'12px' }}>
                            <a
                              href="https://www.myowf.org/home"
                              target="_blank"
                              rel="noreferrer"
                            >
                              HOME
                            </a>
                          </BlackButton>
                        </div>
                        <Box borderLeft="1px solid black"></Box>
                        <div className="menuOption">
                          <BlackButton
                            id="basic-button-about"
                            aria-controls={
                              menuIdOpen == "basic-button-about"
                                ? "basic-menu-about"
                                : undefined
                            }
                            aria-haspopup="true"
                            aria-expanded={
                              menuIdOpen == "basic-button-about"
                                ? "true"
                                : undefined
                            }
                            onClick={handleClick}
                            onMouseEnter={enterButton}
                            onMouseLeave={leaveButton}
                            style={{ zIndex: 1301, marginLeft:"12px", fontSize:'12px'}}
                          >
                            ABOUT
                          </BlackButton>

                          <Menu
                            id="basic-menu-about"
                            anchorEl={anchorEl}
                            open={menuIdOpen == "basic-button-about"}
                            onClose={handleClose}
                            MenuListProps={{
                              "aria-labelledby": "basic-button-about",
                              onMouseLeave: leaveMenu,
                            }}
                            //@ts-ignore
                            getContentAnchorEl={null}
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "center",
                            }}
                            transformOrigin={{
                              vertical: "top",
                              horizontal: "center",
                            }}
                            style={{fontFamily:"din-next-w01-light,din-next-w02-light,din-next-w10-light,sans-serif"}}
                          >
                            <a
                              href="https://www.myowf.org/staff"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <CustomizedMenuItem>
                                <CustomizedMenuItemText>
                                  Staff
                                </CustomizedMenuItemText>
                              </CustomizedMenuItem>
                            </a>
                            <a
                              href="https://www.myowf.org/board"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <CustomizedMenuItem>
                                <CustomizedMenuItemText>
                                  Board of Directors
                                </CustomizedMenuItemText>
                              </CustomizedMenuItem>
                            </a>
                            <a
                              href="https://www.sprucegiftsandprovisions.com/"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <CustomizedMenuItem>
                                <CustomizedMenuItemText>
                                  Spruce Gifts & Provisions
                                </CustomizedMenuItemText>
                              </CustomizedMenuItem>
                            </a>
                            <a
                              href="https://www.myowf.org/contact-us"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <CustomizedMenuItem>
                                <CustomizedMenuItemText>
                                  Contact Us
                                </CustomizedMenuItemText>
                              </CustomizedMenuItem>
                            </a>
                            <a
                              href="https://www.myowf.org/single-post/2021-annual-newsletter"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <CustomizedMenuItem>
                                <CustomizedMenuItemText>
                                  2021 Annual Newsletter
                                </CustomizedMenuItemText>
                              </CustomizedMenuItem>
                            </a>
                            <a
                              href="https://www.myowf.org/blog"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <CustomizedMenuItem>
                                <CustomizedMenuItemText>
                                  Blog
                                </CustomizedMenuItemText>
                              </CustomizedMenuItem>
                            </a>
                            <a
                              href="https://www.myowf.org/financials"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <CustomizedMenuItem>
                                <CustomizedMenuItemText>
                                  Financials
                                </CustomizedMenuItemText>
                              </CustomizedMenuItem>
                            </a>
                          </Menu>
                        </div>
                        <Box borderLeft="1px solid black"></Box>
                        <div className="menuOption">
                          <BlackButton
                            id="basic-button-work"
                            aria-controls={
                              menuIdOpen == "basic-button-work"
                                ? "basic-menu-work"
                                : undefined
                            }
                            aria-haspopup="true"
                            aria-expanded={
                              menuIdOpen == "basic-button-work"
                                ? "true"
                                : undefined
                            }
                            onClick={handleClick}
                            onMouseEnter={enterButton}
                            onMouseLeave={leaveButton}
                            style={{ zIndex: 1301, margin: "auto" , fontSize:'12px'}}
                          >
                            OUR WORK
                          </BlackButton>
                          <Menu
                            id="basic-menu-work"
                            anchorEl={anchorEl}
                            open={menuIdOpen == "basic-button-work"}
                            onClose={handleClose}
                            MenuListProps={{
                              "aria-labelledby": "basic-button-work",
                              onMouseLeave: leaveMenu,
                            }}
                            //@ts-ignore
                            getContentAnchorEl={null}
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "center",
                            }}
                            transformOrigin={{
                              vertical: "top",
                              horizontal: "center",
                            }}
                            style={{fontFamily:"din-next-w01-light,din-next-w02-light,din-next-w10-light,sans-serif"}}
                          >
                            <a
                              href="https://www.myowf.org/sowcc"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <CustomizedMenuItem>
                                <CustomizedMenuItemText>
                                  SOWCC
                                </CustomizedMenuItemText>
                              </CustomizedMenuItem>
                            </a>
                            <a
                              href="https://myowf.brand.live/community-conservation"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <CustomizedMenuItem>
                                <CustomizedMenuItemText>
                                  Community Conservation
                                </CustomizedMenuItemText>
                              </CustomizedMenuItem>
                            </a>
                            <a
                              href="https://www.myowf.org/fiscal-sponsorship"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <CustomizedMenuItem>
                                <CustomizedMenuItemText>
                                  Fiscal Sponsorship Program
                                </CustomizedMenuItemText>
                              </CustomizedMenuItem>
                            </a>
                            <a
                              href="https://www.myowf.org/grants"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <CustomizedMenuItem>
                                <CustomizedMenuItemText>
                                  Grant Program
                                </CustomizedMenuItemText>
                              </CustomizedMenuItem>
                            </a>
                            <a
                              href="https://www.myowf.org/notable-accomplishments"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <CustomizedMenuItem>
                                <CustomizedMenuItemText>
                                  Notable Accomplishments
                                </CustomizedMenuItemText>
                              </CustomizedMenuItem>
                            </a>
                            <a
                              href="https://www.myowf.org/advised-funds-program"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <CustomizedMenuItem>
                                <CustomizedMenuItemText>
                                  Advised Funds Program
                                </CustomizedMenuItemText>
                              </CustomizedMenuItem>
                            </a>
                            <a
                              href="https://www.myowf.org/k9team"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <CustomizedMenuItem>
                                <CustomizedMenuItemText>
                                  K9 Wildlife Detection Team
                                </CustomizedMenuItemText>
                              </CustomizedMenuItem>
                            </a>
                            <a
                              href="https://www.myowf.org/_files/ugd/aa665e_6e354fa16046484798688478d1cf2cde.pdf"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <CustomizedMenuItem>
                                <CustomizedMenuItemText>
                                  Migration Safe Fencing Manual
                                </CustomizedMenuItemText>
                              </CustomizedMenuItem>
                            </a>
                          </Menu>
                        </div>
                        <Box borderLeft="1px solid black"></Box>
                        <div  style={{width:'120px'}}>
                          <BlackButton
                            id="basic-button-action"
                            aria-controls={
                              menuIdOpen == "basic-button-action"
                                ? "basic-menu-action"
                                : undefined
                            }
                            aria-haspopup="true"
                            aria-expanded={
                              menuIdOpen == "basic-button-action"
                                ? "true"
                                : undefined
                            }
                            onClick={handleClick}
                            onMouseEnter={enterButton}
                            onMouseLeave={leaveButton}
                            style={{ zIndex: 1301, margin: "auto",marginLeft:"9px", fontSize:'12px' }}
                          >
                            TAKE ACTION
                          </BlackButton>
                          <Menu
                            id="basic-menu-action"
                            anchorEl={anchorEl}
                            open={menuIdOpen == "basic-button-action"}
                            onClose={handleClose}
                            MenuListProps={{
                              "aria-labelledby": "basic-button-action",
                              onMouseLeave: leaveMenu,
                            }}
                            //@ts-ignore
                            getContentAnchorEl={null}
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "center",
                            }}
                            transformOrigin={{
                              vertical: "top",
                              horizontal: "center",
                            }}
                            style={{fontFamily:"din-next-w01-light,din-next-w02-light,din-next-w10-light,sans-serif"}}
                          >
                            <a
                              href="https://www.myowf.org/watchforwildlife"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <CustomizedMenuItem>
                                <CustomizedMenuItemText>
                                  Watch for Wildlife License Plate
                                </CustomizedMenuItemText>
                              </CustomizedMenuItem>
                            </a>
                            <a
                              href="https://www.myowf.org/membership"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <CustomizedMenuItem>
                                <CustomizedMenuItemText>
                                  Membership
                                </CustomizedMenuItemText>
                              </CustomizedMenuItem>
                            </a>
                            <a
                              href="https://www.myowf.org/legacy"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <CustomizedMenuItem>
                                <CustomizedMenuItemText>
                                  Legacy Society
                                </CustomizedMenuItemText>
                              </CustomizedMenuItem>
                            </a>
                            <a
                              href="https://www.oregonisalive.org/"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <CustomizedMenuItem>
                                <CustomizedMenuItemText>
                                  OCRF
                                </CustomizedMenuItemText>
                              </CustomizedMenuItem>
                            </a>
                            <a
                              href="https://fundraise.givesmart.com/e/4wqXfw?vid=txwta"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <CustomizedMenuItem>
                                <CustomizedMenuItemText>
                                  Across the Arches
                                </CustomizedMenuItemText>
                              </CustomizedMenuItem>
                            </a>
                          </Menu>
                        </div>
                        <Box borderLeft="1px solid black"></Box>
                        <div className="menuOption">
                          <BlackButton
                            id="basic-button-why"
                            aria-controls={
                              menuIdOpen == "basic-button-why"
                                ? "basic-menu"
                                : undefined
                            }
                            aria-haspopup="true"
                            aria-expanded={
                              menuIdOpen == "basic-button-why"
                                ? "true"
                                : undefined
                            }
                            onClick={handleClick}
                            style={{ zIndex: 1301, margin: "auto", fontSize:'12px' }}
                          >
                            <a
                              href="https://www.myowf.org/donate"
                              target="_blank"
                              rel="noreferrer"
                            >
                             WHY US?
                            </a>
                          </BlackButton>
                         
                        </div>
                      </div>
                    )}
                  </Box>
                </Box>
              </div>
            </div>

            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              margin="auto"
              position="relative"
              border="0px solid black"
              minHeight={300}
              width="80%"
            >
              {banner && isMobile ? (
                <AspectRatio className="aspectratio">
                  <img src={`${banner}`} alt="Banner" />
                </AspectRatio>
              ) : (
                <AspectRatio style={{ borderRadius: "sm" }}>
                  <img
                    src={`${banner}?h=350&w=1200&fit=crop&auto=format`}
                    alt="Banner"
                    style={{width: defaultImage ? '1200px' : '', height: defaultImage ? '350px': ''}}
                  />
                </AspectRatio>
              )}

              <Box position={"absolute"} right="15%" bottom="10px">
                <LightGreenButton>
                  <a
                    href="https://fundraise.givesmart.com/form/4JCecw?vid=v7zmp"
                    target="_blank"
                    rel="noreferrer"
                  >
                    DONATE
                  </a>
                </LightGreenButton>
              </Box>
            </Box>
          </Box>
        </Grid>
        <Grid
          item
          container
          // width={"50%"}
        >
          <Box flexDirection="column" className={"projectDescription"}>

          <Box  marginBottom="1em" marginTop="1.5em">
              <b>
                {daterange.length > 2 || dateongoing.length > 2 ? "Project Date" : ""}
              </b>
          </Box>
          <Box marginBottom="0.8em">
            {daterange
              ? JSON.parse(daterange).map((date: any, index: any) => {
                let _date = new Date(date[0]);
                let _date2 = new Date(date[1]);
                let dateMDY = `${_date.getMonth() + 1}/${_date.getDate()}/${_date.getFullYear()}`;
                let dateMDY2 = `${_date2.getMonth() + 1}/${_date2.getDate()}/${_date2.getFullYear()}`;
                
                  return (
                    <div>
                          <Box>{dateMDY+'-'+dateMDY2}</Box>
                          
                    </div>
                  );
                })
              : dateongoing
              ? JSON.parse(dateongoing).map((date: any, index: any) => {
                let _date = new Date(date);
                let dateMDY = `${_date.getMonth() + 1}/${_date.getDate()}/${_date.getFullYear()}`;
                  return (
                    <Box>{dateMDY}</Box>
                  );
                })
              : []}
          </Box>




            <Box>
              <b>{title}</b>
            </Box>
            <Box >{description}</Box>
            <Box  marginBottom="3em" marginTop="1.5em">
              <b>
                {" "}
                {events.length > 2 ? "Upcoming Events" : "No Upcoming Events"}
              </b>
            </Box>
            <Box marginLeft="3em">
              {events.length > 2
                ? JSON.parse(events).map((event: any, index: any) => {
                    return (
                      <Box key={`event${index}`} marginBottom="1.5em">
                        <Box
                          display="flex"
                          flexDirection="row"
                          alignItems="center"
                        >
                          <div className="project-history-bullet"></div>
                          <Box display="flex" flexDirection="column">
                            <Box marginLeft="3em">{event.title}</Box>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })
                : []}
            </Box>
            <Box margin={"10px 0px 10px 0px"} marginBottom="3em">
            <b> {milestones.length > 2 ? "Project History" : ""}</b>
          </Box>
          <Box  marginBottom="3em" marginTop="1.5em">
              <b>
                {" "}
                {links.length > 2 || linksy.length > 2 ? "Project Milestones" : ""}
              </b>
          </Box>
          <Box marginLeft="3em">
            {milestones
              ? JSON.parse(milestones).map((milestone: any, index: any) => {
                  return (
                    <Box key={`milestone${index}`} marginBottom="1.5em">
                      <Box
                        display="flex"
                        flexDirection="row"
                        alignItems="center"
                      >
                        <div className="project-history-bullet"></div>
                        <Box display="flex" flexDirection="column">
                          <Box marginLeft="3em">{milestone.title}</Box>
                        </Box>
                      </Box>
                    </Box>
                  );
                })
              : []}
          </Box>

            <Box  marginBottom="3em" marginTop="1.5em">
              <b>
                {" "}
                {pdfs.length > 2 ? "Project Related Links" : "No Project Related Links Available"}
              </b>
            </Box>
            <Box marginLeft="3em">
              {pdfs.length > 2
                ? JSON.parse(pdfs).map((pdf: any, index: any) => {
                    return (
                      <Box key={`event${index}`} marginBottom="1.5em">
                        <Box
                          display="flex"
                          flexDirection="row"
                          alignItems="center"
                          
                        >
                          <div className="project-history-bullet"></div>
                          <Box display="flex" flexDirection="column">

                            <a
                                href={pdf.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <Box marginLeft="3em">{pdf.title}</Box>
                            </a>





                          </Box>
                        </Box>
                      </Box>
                    );
                  })
                : []}
            </Box>



            <Box  marginBottom="3em" marginTop="1.5em">
              <b>
                {" "}
                {links.length > 2 || linksy.length > 2 ? "Project Related Links" : "No Project Related Links Available"}
              </b>
            </Box>
            <Box marginLeft="3em">
              {links.length > 2
                ? JSON.parse(links).map((link: any, index: any) => {
                    return (
                      <Box key={`event${index}`} marginBottom="1.5em">
                        <Box
                          display="flex"
                          flexDirection="row"
                          alignItems="center"
                          
                        >
                          <div className="project-history-bullet"></div>
                          <Box display="flex" flexDirection="column">

                            <a
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <Box marginLeft="3em">{link.title}</Box>
                            </a>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })
                : []}

              {linksy.length > 2
                ? JSON.parse(linksy).map((link: any, index: any) => {
                    return (
                      <Box key={`event${index}`} marginBottom="1.5em">
                        <Box
                          display="flex"
                          flexDirection="row"
                          alignItems="center"
                          
                        >
                          <div className="project-history-bullet"></div>
                          <Box display="flex" flexDirection="column">

                            <a
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <Box marginLeft="3em">{link.title}</Box>
                            </a>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })
                : []}
          </Box>
          <Box  marginBottom="3em" marginTop="1.5em">
              
              <b>
                  {photos && JSON.parse(photos).length > 2 ? "Project Still Photos" : "No additional photos present"}
                
              </b>
              
          {
            photos &&
            JSON.parse(photos).length > 2 ?
          <div>
          <br/> 
          <Carousel>
             {
              
                packPhotos().map((item:any, index:any) => {
                        console.log(item)
                          return <Banner item={item} key={index} contentPosition={item.contentPosition} />
                      })
              
            }
          </Carousel>
          </div>
          :[]}
          </Box>




          <Box margin={"10px 0px 60px 0px"}>
            <LightGreenButton><a
                    href="https://www.myowf.org/"
                    target="_blank"
                    rel="noreferrer"
                  >Get Involved</a></LightGreenButton>
          </Box>


          
          </Box>
        </Grid>
        <Box>
          <Footer/>
        </Box>
      </Grid>
    </>
  );
};

export default ProjectDetail;
