import {
  IEntry,
  IProjectMilestone,
  IProjectEvents,
  ISelectedDetailPageProps,
  IProjectProposalPdf,
  IProjectLinks,
} from "@/interfaces/elebase";
import Grid from "@mui/material/Grid";
import mapboxgl, { AnyLayer, GeoJSONSource, LngLatBounds, LngLatBoundsLike } from "mapbox-gl";
import React, { Component, useEffect } from "react";
import {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
} from "geojson";
import Popup from "@/components/Map/Popup";
import ReactDOM from "react-dom";
import Router from "next/router";
import {
  setSelectedProject,
  setSelectedDetailPageProps,
} from "@/redux/app/appSlice";
import { isMobile, isLandscapeOrientation } from "@/interfaces/useDevice";
import { useAppDispatch } from "@/redux/hooks";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { RootState } from "@/redux/store";
import { ElebaseCollection } from "@/collections/elebase";
import { Result } from "@mapbox/mapbox-gl-geocoder";
import CustomMenuDrawer from "../MenuDrawer/MenuDrawer";
import LayersModal from "./Modal";
import Checkbox from "@mui/material/Checkbox";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { border, Box } from "@mui/system";
import { polygon as turfPolygon, centroid as turfCentroid, bbox } from "@turf/turf";
import Image from 'next/image'
import Icon from "@mui/material/Icon";
import { IconButton, Zoom } from "@mui/material";


mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

interface Props {
  // entries: any[]
  filteredEntries: IEntry[];
  category: string[];
  historicVsActive: number | number[];
  setSelectedProject: any;
  setSelectedDetailPageProps: any;
}

interface State {
  mapLoaded: boolean;
  layersLoaded: boolean;
  shownModal:boolean;
}

interface IIconImageActiveHistoric {
  active: string;
  historic: string;
}



class Map extends Component<Props, State> {
  private allEntries: IEntry[] = [];
  private static map: mapboxgl.Map;
  // private static marker = new mapboxgl.Marker();
  private static firstSymbolId: string = "";
  private static queryAttempt: number = 0;
  private static projectPolys: Feature<Geometry, GeoJsonProperties>[] = [];
  // Create a popup, but don't add it to the map yet.
  private static popup = new mapboxgl.Popup({
    closeButton: true,
    closeOnClick: true,
  });

  state = {
    mapLoaded: false,
    layersLoaded: false,
    shownModal:false,
  };

  private loadFirstSymbolId(): void {
    const styleLayers: mapboxgl.AnyLayer[] | undefined =
      Map.map.getStyle().layers;
    // Find the index of the first symbol layer in the map style
    if (styleLayers != undefined) {
      for (let i = 0; i < styleLayers.length; ++i) {
        if (styleLayers[i].type === "symbol") {
          // Set style symbol and bail
          Map.firstSymbolId = styleLayers[i].id;
          return;
        }
      }
    }

    // Clear out any previous value if there was no match
    Map.firstSymbolId = "";
  }

  private static flyToProject(coordinates: any): void {
    Map.map.flyTo({
      // These options control the ending camera position: centered at
      // the target, at zoom level 9, and north up.
      center: coordinates,
      zoom: 8,
      // bearing: 20,
      // pitch: 60,

      // These options control the flight curve, making it move
      // slowly and zoom out almost completely before starting
      // to pan.
      speed: 0.4, // make the flying slow
      curve: 1, // change the speed at which it zooms out

      // This can be any easing function: it takes a number between
      // 0 and 1 and returns another number between 0 and 1.
      easing: (t) => t,

      // this animation is considered essential with respect to prefers-reduced-motion
      essential: true,
    });
  }



  private static closePopups = () =>{
    const popup = document.getElementsByClassName('mapboxgl-popup');
    if ( popup.length ) {
        popup[0].remove();
        (Map.map.getSource("projectAreaSource") as GeoJSONSource).setData({
          type: "FeatureCollection",
          features: [],
        });
    }
  }

  private showModal = (e:any) =>{
    this.setState({
      ...this.state,
      shownModal:true,
    })
    
    let ImageLayer= document.getElementById('imageLayer')
    let IconLayer= document.getElementById('IconLayers')
   
    if (ImageLayer!=null){
        //e.target.style.backgroundColor='#5C767F'
        ImageLayer.setAttribute('src', '/layers_white.svg')
    }
    if(IconLayer!=null){
      IconLayer.setAttribute('style', 'background:#5C767F !important;border:2px solid white !important;');

    }
  }

  private closeModal = ()=>{
    this.setState({
      ...this.state,
      shownModal:false
    })

    let ImageLayer= document.getElementById('imageLayer')
    let IconLayer= document.getElementById('IconLayers')
   
    if (ImageLayer!=null){
        //e.target.style.backgroundColor='#5C767F'
        ImageLayer.setAttribute('src', '/layers.svg')
    }
    if(IconLayer!=null){
      IconLayer.setAttribute('style', 'background:white !important;border:2px solid #5C767F !important;');
    }
  }

  private static navToProjectDetail(
    projectTitle: string,
    projectBanner: string,
    projectDescription: string,
    projectMilestones: IProjectMilestone[],
    projectEvents: IProjectEvents[],
    photos: string[],
    projectPdfs: IProjectProposalPdf[],
    projectLinks: IProjectLinks[],
    projectLinksY: IProjectLinks[],
    dateRange: string[],
    dateOngoing: string[],
  ): void {
    localStorage.setItem("title", projectTitle);
    localStorage.setItem("banner", projectBanner);
    localStorage.setItem("description", projectDescription);
    
    localStorage.setItem(
      "milestones",
      JSON.stringify(projectMilestones) as any
    );
    localStorage.setItem(
      "photos",
      JSON.stringify(photos) as any
    );

    localStorage.setItem(
      "pdfs",
      JSON.stringify(projectPdfs) as any
    );

    localStorage.setItem(
      "links",
      JSON.stringify(projectLinks) as any
    );

    localStorage.setItem(
      "linksY",
      JSON.stringify(projectLinksY) as any
    );

    localStorage.setItem(
      "dateRange",
      JSON.stringify(dateRange) as any
    );

    localStorage.setItem(
      "dateOngoing",
      JSON.stringify(dateOngoing) as any
    );

    // console.log(dateRange)

    localStorage.setItem("events", JSON.stringify(projectEvents) as any);
    const projectTitleNoSlashes = projectTitle.replace(/\//g,"");
    window.open(`/project/${projectTitleNoSlashes}`);
  }

  private handleLayerVisibilityChange(event: React.ChangeEvent<HTMLInputElement>, layerId: string, layerLabelId: string = '') {
    if (event.target.checked === true) {
      Map.map.setLayoutProperty(layerId, "visibility", "visible");
      layerLabelId ? Map.map.setLayoutProperty(layerLabelId, "visibility", "visible") : null;
      if (layerId == "ecoregions" ) {
        Map.map.setLayoutProperty("Place Points", "visibility", "none")
        Map.map.setLayoutProperty("Place Labels", "visibility", "none")
      };
      if (layerId == 'owf-satellite') {
        [
          "clipped-tree-points-8fpm0q",
          "road",
          "Place Points",
          "road labels",
          "Park Labels",
          "Place Labels",
          "river and stream labels",
          "rivers simplified 0.25 mi",
          "rivers simplified 1.0 mi",
          "rivers simplified 2 mi",
          "basin centroids",
          "background",
          "hillshade",
          "water"
        ]
        .forEach(function (id) {
          Map.map.setLayoutProperty(id, "visibility", "none");
        });
        [
          "road sat",
          "Place Points sat",
          "road labels sat",
          "Park Labels sat",
          "Place Labels sat",
          "river and stream labels sat",
          "rivers simplified 0.25 mi sat",
          "rivers simplified 1.0 mi sat",
          "rivers simplified 2 mi sat",
          "basin centroids sat",
          "background sat"
        ].forEach(function (id) {
          Map.map.setLayoutProperty(id, "visibility", "visible");
        });
      };
    } else {
      Map.map.setLayoutProperty(layerId, "visibility", "none");
      layerLabelId ? Map.map.setLayoutProperty(layerLabelId, "visibility", "none") : null;
      if (layerId == "ecoregions") {
        Map.map.setLayoutProperty("Place Points", "visibility", "visible")
        Map.map.setLayoutProperty("Place Labels", "visibility", "visible")
      };
      if (layerId == 'owf-satellite') {
        [
          "clipped-tree-points-8fpm0q",
          "road",
          "Place Points",
          "road labels",
          "Park Labels",
          "Place Labels",
          "river and stream labels",
          "rivers simplified 0.25 mi",
          "rivers simplified 0.5 mi",
          "rivers simplified 1.0 mi",
          "rivers simplified 1.5 mi",
          "rivers simplified 2 mi",
          "basin centroids",
          "background",
          "hillshade",
          "water"
        ].forEach(function (id) {
          Map.map.setLayoutProperty(id, "visibility", "visible");
        });
        [
          "road sat",
          "Place Points sat",
          "road labels sat",
          "Park Labels sat",
          "Place Labels sat",
          "river and stream labels sat",
          "rivers simplified 0.25 mi sat",
          "rivers simplified 1.0 mi sat",
          "rivers simplified 2 mi sat",
          "basin centroids sat",
          "background sat"
        ].forEach(function (id) {
          Map.map.setLayoutProperty(id, "visibility", "none");
        });
      };
    }
  }

  private static showProjectPolygons = (projectId:string)=>{
    let filteredPolys = Map.projectPolys.filter(
      (el:any) => el?.properties.id == projectId
    );
    if (filteredPolys){
      (Map.map.getSource("projectAreaSource") as GeoJSONSource).setData({
        type: "FeatureCollection",
        features: filteredPolys,
      });
    }
    return filteredPolys;
  }

  private addLayers = () => {
    const geojson = {
      type: "FeatureCollection",
      features: [],
    };

    Map.map.addSource("projectAreaSource", {
      type: "geojson",
      data: geojson as FeatureCollection<Geometry, GeoJsonProperties>,
    });

    // old, raster tile sat layer
    // Map.map.addLayer(
    //   {
    //     id: "owf-satellite",
    //     source: {
    //       type: "raster",
    //       tiles: [
    //         "https://api.mapbox.com/styles/v1/brycegartrell/clbquyvj2001614s3pki2dnqr/tiles/{z}/{x}/{y}?access_token=" +
    //           mapboxgl.accessToken,
    //       ],
    //     },
    //     type: "raster",
    //     layout: { visibility: "none" },
    //   },
    //   "ecoregions"
    // );

    Map.map.addLayer(
      {
        id: "projectArea",
        type: "fill",
        source: "projectAreaSource", // reference the data source
        layout: {},
        paint: {
          "fill-color": ["get", "color"],
          "fill-antialias": true,
          "fill-outline-color": ["get", "outline"], // if we need outlines...
        },
      },
      Map.firstSymbolId
    );

    Map.map.addSource("projectPointsSource", {
      type: "geojson",
      data: geojson as FeatureCollection<Geometry, GeoJsonProperties>,
    });

    Map.map.addLayer({
      id: "projectPoints",
      type: "symbol",
      source: "projectPointsSource",
      layout: {
        "icon-image": ["get", "icon"],
        "icon-size": isMobile ? 0.6 : 1,
        "icon-allow-overlap": true,
        "icon-anchor": "bottom",
      },
    });

    // When a click event occurs on a feature in the places layer, open a popup at the
    // location of the feature, with description HTML from its properties.
    Map.map.on("click", "projectPoints", (e: any) => {
      // Copy coordinates array.
      Map.showProjectPolygons(e.features[0].properties.id);
      const coordinates = e.features[0].geometry.coordinates.slice();
      const projectId = e.features[0].properties.id;
      const title = e.features[0].properties.title;
      const description = e.features[0].properties.description;
      const banner = JSON.parse(e.features[0].properties.banner);
      const milestones: IProjectMilestone[] = JSON.parse(
        e.features[0].properties.milestones
      );
      localStorage.setItem("title", "");
      localStorage.setItem("banner", "");
      localStorage.setItem("description", "");
      localStorage.setItem("milestones", "");
      localStorage.setItem("events", "");
      const photos: string[] = JSON.parse(e.features[0].properties.photos);
      const events:IProjectEvents[] = JSON.parse(e.features[0].properties.events);
      const pdfs : IProjectProposalPdf[] = JSON.parse(e.features[0].properties.proposalPdf);
      const links : IProjectLinks[] = JSON.parse(e.features[0].properties.relatedLinks);
      const linksY : IProjectLinks[] = JSON.parse(e.features[0].properties.relatedLinksYt);
      const dateRange : string[] = JSON.parse(e.features[0].properties.dateRange);
      const dateOngoing : string[] = JSON.parse(e.features[0].properties.dateOngoing);


      if (this.props.category) {
        this.allEntries &&
          this.allEntries.forEach((entry: IEntry, index: number) => {
            if (entry.id === projectId) {
              this.props.setSelectedProject(entry);
              const selectedDetailPageProps: ISelectedDetailPageProps = {
                projectId: projectId,
                title: title,
                description: description,
                photos: photos,
                banner: banner,
                milestones: milestones,
                events: events,
                pdfs: pdfs,
                links: links,
                linksY: linksY,
                dateRange: dateRange,
                dateOngoing: dateOngoing,
              };
              this.props.setSelectedDetailPageProps(selectedDetailPageProps);
            }
          });
      } else {
        this.props.filteredEntries &&
          this.props.filteredEntries.forEach((entry: IEntry, index: number) => {
            if (entry.id === projectId) {
              this.props.setSelectedProject(entry);

              const selectedDetailPageProps: ISelectedDetailPageProps = {
                projectId: projectId,
                title: title,
                description: description,
                photos: photos,
                banner: banner,
                milestones: milestones,
                events: events,
                pdfs: pdfs,
                links: links,
                linksY: linksY,
                dateRange: dateRange,
                dateOngoing: dateOngoing,
                
              };
              this.props.setSelectedDetailPageProps(selectedDetailPageProps);
            }
          });
      }

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      let placeholder = document.createElement("div");

      ReactDOM.render(
        <Popup
          title={title}
          description={description}
          photos={photos}
          milestones={milestones}
          events={events}
          banner={banner}
          pdfs={pdfs}
          projectLinks={links}
          projectLinksY={linksY}
          dateRange = {dateRange}
          dateOngoing = {dateOngoing}
          handleFlyTo={Map.flyToProject}
          navToProjectDetail={Map.navToProjectDetail}
          coordinates={coordinates}
          onClose={Map.closePopups}
        />,
        placeholder
      );

      

      Map.popup = new mapboxgl.Popup({
        offset: isMobile ? [0, -30] : [0, -50],
        closeOnClick: false,
        anchor: "bottom",
      })
        .setLngLat(coordinates)
        .setDOMContent(placeholder)
        .addTo(Map.map);
    });
    
    // Change the cursor to a pointer when the mouse is over the places layer.
    Map.map.on("mouseenter", "projectPoints", () => {
      Map.map.getCanvas().style.cursor = "pointer";
    });

    // Change it back to a pointer when it leaves.
    Map.map.on("mouseleave", "projectPoints", () => {
      Map.map.getCanvas().style.cursor = "";
    });
  };

  async initializeMap() {
    const bounds: LngLatBoundsLike = [
      [-135, 38], // Southwest coordinates
      [-109, 55], // Northeast coordinates
    ];
    const entries = await ElebaseCollection.getEntries();
    this.allEntries = [];
    const customDataFeatures: any = [];
    // console.log(entries)
    entries.forEach((entry: IEntry) => {
      let filteredElementCategories = entry.elements.filter(
        (el) => el.name == "OWF Project Category"
      );
      let elementCategories =
        filteredElementCategories[0] && filteredElementCategories[0].data;
      elementCategories &&
        elementCategories.forEach((cat: any) => {
          let coordinates: any = [];
          const arr_coor = 
            entry?.elements?.filter((el) => el.name == "OWF Project Area")
          
          const bannerObject = entry.elements.filter(
            (el) => el.name == "OWF Project Banner"
          )?.[0]?.data;


          const projectBanner =
            bannerObject && bannerObject.length > 0
              ? bannerObject.map((item: any) => item.url)
              : [];
          const photoDataArr = entry.elements.filter(
            (el) => el.name == "OWF Project Still Photos"
          )?.[0]?.data;
          const projectStillPhotos =
            photoDataArr && photoDataArr.length > 0
              ? photoDataArr.map((item: any) => item.url)
              : [];
            
            const projectFeatures = arr_coor?.[0]?.data?.features;
                projectFeatures.forEach((element:any) => {
                  if (element.type.type === "point"){
                    coordinates = JSON.parse(element.json) as Geometry;    
                  }
            });

            customDataFeatures.push({
              type: "Feature",
              properties: {
                project_id: entry.id,
                title: entry.elements.filter(
                  (el) => el.name == "OWF Project Title"
                )?.[0]?.data,
                description: entry.elements.filter(
                  (el) => el.name == "OWF Project Description"
                )?.[0]?.data,
                banner: projectBanner.length > 0 ? projectBanner[0] : "",
                milestones: entry.elements.filter(
                  (el) => el.name == "Project Milestone Element"
                )?.[0]?.data,
                proposalPdf:entry.elements.filter(
                  (el) => el.name == "OWF Project Proposal PDF"
                )?.[0]?.data,

                events:entry.elements.filter(el => el.name == 'Project Upcoming Event Element')?.[0]?.data,
                relatedLinks:entry.elements.filter(el => el.name == 'OWF Project Related Links')?.[0]?.data,
                relatedLinksYt:entry.elements.filter(el => el.name == 'OWF Project Related Links (YouTube)')?.[0]?.data,

                dateRange:entry.elements.filter(el => el.name == 'OWF Project Dates ( Range )')?.[0]?.data,
                dateOngoing:entry.elements.filter(el => el.name == 'OWF Project Date ( Ongoing )')?.[0]?.data,
                
                
                photos: projectStillPhotos,
                place_name: "",
                center: "",
                place_type: [],
              },
              geometry: {
                coordinates: coordinates.coordinates,
                type: "Point",
                place_name: "",
              },
            });
          this.allEntries.push(entry);
        });
    });

    function forwardGeocoder(query: any): Result[] {
      const customData = {
        features: customDataFeatures,
        type: "FeatureCollection",
      };

      const matchingFeatures: Result[] = [];
      for (const feature of customData.features as any) {
        // Handle queries with different capitalization
        // than the source data by calling toLowerCase().
        if (feature.properties.title != null) {
          if (
            feature.properties.title.toLowerCase().includes(query.toLowerCase())
          ) {
            // Add a tree emoji as a prefix for custom
            // data results using carmen geojson format:
            // https://github.com/mapbox/carmen/blob/master/carmen-geojson.md
            feature["place_name"] = `(P) ${feature.properties.title}`;
            feature["center"] = feature.geometry.coordinates;
            feature["place_type"] = ["park"];
            matchingFeatures.push(feature);
          }
        }
      }
      return matchingFeatures;
    }

    (async () => {
      const map = new mapboxgl.Map({
        container: "mapId",
        style: "mapbox://styles/brycegartrell/ckz4vgr32000t14pck0hu8vfx",
        center: [-120.5542, 43.8041],
        maxPitch: 63,
        zoom: isMobile ? 4.9 : 5.5,
        maxBounds: bounds,
        //attributionControl: false
      });
      Map.map = map;

      await Map.map.once("load");

      // Add daytime fog
      Map.map.setFog({
        "horizon-blend": 0.2,
        color: "#F8F0E3",
        //@ts-ignore
        // "high-color": "#ADD8E6",
        // "space-color": "#D8F2FF",
        // "star-intensity": 0.0,
      });

      // Add some 3D terrain
      Map.map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.terrain-rgb",
        tileSize: 512,
        maxzoom: 14,
      });

      Map.map.setTerrain({
        source: "mapbox-dem",
        exaggeration: 1.5,
      });
    })();

    // Add the control to the map.
    // @ts-ignore
    const mapboxGeocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      countries: "us",
      //Limits search results for Oregon
      bbox: [
        -124.53962923191105, 42.00055923454974, -116.47704286477747,
        46.22545075313843,
      ],
      mapboxgl: mapboxgl,
      localGeocoder: forwardGeocoder,
      marker: false,
    });

    const GeoCoderElement = window.document.getElementById("geocoder")!;
    GeoCoderElement.appendChild(mapboxGeocoder.onAdd(Map.map));
    // add navigation control (the +/- zoom buttons)
    mapboxGeocoder.on("result", function (e) {
      let polies = Map.showProjectPolygons(e.result.properties.project_id);
      if (polies.length>0){
        //@ts-ignore
        let poly: any = turfPolygon(polies[0]?.geometry.coordinates);
        // let centroid = turfCentroid(poly);
        // coordinates = centroid.geometry.coordinates; 
        let mybbox = bbox(poly);
        
        //@ts-ignore
        const bounds: LngLatBounds = [[mybbox[0],mybbox[1]],[mybbox[2],mybbox[3]]]
        Map.map.fitBounds(bounds, {
          padding: 60,
          offset: [0, 100],
        })
      } else {
        let coordinates:any = []
        coordinates = e.result.center;
        Map.flyToProject(coordinates);
      }

        if (typeof e.result.properties.project_id != "undefined") {
          let placeholder = document.createElement("div");
          const elements = document.getElementsByClassName("mapboxgl-popup");
          //@ts-ignore
          for (let element of elements) {
            element.remove();
          }
          ReactDOM.render(
            <Popup
              title={e.result.properties.title}
              description={e.result.properties.description}
              photos={e.result.properties.photos || []}
              milestones={e.result.properties.milestones || []}
              events={e.result.properties.events || []}
              banner={e.result.properties.banner}
              pdfs={e.result.properties.proposalPdf}
              projectLinks={e.result.properties.relatedLinks || []}
              projectLinksY={e.result.properties.relatedLinksYt || []}
              dateRange = {e.result.properties.dateRange || []}
              dateOngoing = {e.result.properties.dateOngoing || []}
              handleFlyTo={Map.flyToProject}
              navToProjectDetail={Map.navToProjectDetail}
              coordinates={e.result.center}
              onClose={Map.closePopups}
            />,
            placeholder
          );

          Map.popup = new mapboxgl.Popup({
            offset: [0, -50],
            closeOnClick: true,
          })
            .setLngLat(e.result.center)
            .setDOMContent(placeholder)
            .addTo(Map.map);
            
        }
      
     /* const coordinates = e.result.bboxgeojson.coordinates[0];
      var bounds: LngLatBoundsLike = coordinates.reduce(function (
        bounds: any,
        coord: any
      ) {
        return bounds.extend(coord);
      },
      new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
      Map.map.fitBounds(bounds, {
        padding: 60,
        offset: [0, -100],
      });*/
    })


  
    //const inputField = document.querySelector('mapboxgl-ctrl-geocoder mapboxgl-ctrl--li');

    if (!isMobile) {
      Map.map.addControl(new mapboxgl.NavigationControl());
    }
    


    Map.map.on('click', (e) => {
      Map.closePopups()
    });


    Map.map.on("load", async () => {
      console.log("map loaded");
      this.loadFirstSymbolId();
      this.addLayers();
      this.setState({
        ...this.state,
        mapLoaded: true,
      });
      const layers = Map.map.getStyle().layers;
     

      Map.map.on("style.load", async () => {
        console.log("style loaded");
        this.loadFirstSymbolId();
        this.addLayers();
        this.setState({
          ...this.state,
          mapLoaded: true,
        });
      });
      let firstTag = document.getElementsByClassName('mapboxgl-ctrl-attrib-inner')
      if (firstTag!=null){
        firstTag[0].firstChild?.remove()
      }

      let secTag = document.getElementsByClassName('mapbox-improve-map')
      if (secTag!=null){
        secTag[0].firstChild?.remove()
      }
    });
  }

  private updateProjects = (entries: IEntry[]) => {
    if (this.state.mapLoaded === false) {
      return;
    }

    // Create geojson object to pass to mapbox layer source
    let projectPoints: Feature<Geometry, GeoJsonProperties>[] = [];
    

    entries &&
      entries.forEach((entry: IEntry, index: number) => {
        const projectId = entry.id;
        const projectArea = entry.elements.filter(
          (el) => el.name == "OWF Project Area"
        );
        const projectTitle = entry.elements.filter(
          (el) => el.name == "OWF Project Title"
        )?.[0]?.data;
        const projectActive = entry.elements.filter(
          (el) => el.name == "OWF Project Active"
        )?.[0]?.data;
        const projectBannerPhoto = entry.elements.filter(
          (el) => el.name == "OWF Project Banner"
        )?.[0]?.data;
        const projectBanner =
          projectBannerPhoto && projectBannerPhoto.length > 0
            ? projectBannerPhoto.map((item: any) => item.url)
            : [];

        const proposalPdf = entry.elements.filter(
              (el) => el.name == "OWF Project Proposal PDF"
            )?.[0]?.data;
  

        const relatedLinks : IProjectLinks = entry.elements.filter(el => el.name == 'OWF Project Related Links')?.[0]?.data;
        const relatedLinksYt : IProjectLinks = entry.elements.filter(el => el.name == 'OWF Project Related Links (YouTube)')?.[0]?.data;

        const dateRange : string [] = entry.elements.filter(el => el.name == 'OWF Project Dates ( Range )')?.[0]?.data;
        const dateOngoing : string [] = entry.elements.filter(el => el.name == 'OWF Project Date ( Ongoing )')?.[0]?.data;

      


        const projectMilestones: IProjectMilestone[] = entry.elements.filter(
          (el) => el.name == "Project Milestone Element"
        )?.[0]?.data;
        const projectEvents: IProjectEvents[] = entry.elements.filter(el => el.name == 'Project Upcoming Event Element')?.[0]?.data;
        const photoDataArr = entry.elements.filter(
          (el) => el.name == "OWF Project Still Photos"
        )?.[0]?.data;
        const projectStillPhotos =
          photoDataArr && photoDataArr.length > 0
            ? photoDataArr.map((item: any) => item.url)
            : [];
        const projectDescription = entry.elements.filter(
          (el) => el.name == "OWF Project Description"
        )?.[0]?.data;

        const projectFeatures = projectArea?.[0]?.data?.features;

        let IconImage: IIconImageActiveHistoric = {
          active: "",
          historic: "",
        };
        let filteredElementCategories = entry.elements.filter(
          (el) => el.name == "OWF Project Category"
        );
        let elementCategories =
          filteredElementCategories[0] && filteredElementCategories[0].data;
        elementCategories &&
          elementCategories.forEach((cat: any) => {
            IconImage = this.getIconImage(cat.text);
          });

        projectFeatures?.forEach((feature: any) => {
          if (feature.type.type === "point") {
            projectPoints.push({
              type: "Feature",
              geometry: JSON.parse(feature.json) as Geometry,
              properties: {
                id: projectId,
                title: projectTitle,
                photos: projectStillPhotos,
                description: projectDescription,
                active: projectActive ? "active" : "historic",
                banner: projectBanner,
                milestones: projectMilestones,
                events: projectEvents,
                proposalPdf: proposalPdf  || [],
                relatedLinks: relatedLinks  || [],
                relatedLinksYt: relatedLinksYt || [],
                dateRange : dateRange || [],
                dateOngoing : dateOngoing || [],
                icon: projectActive ? IconImage.active : IconImage.historic,
              },
            });
          } else if (feature.type.type === "polygon") {
            Map.projectPolys.push({
              type: "Feature",
              geometry: JSON.parse(feature.json) as Geometry,
              properties: {
                id: projectId,
                title: projectTitle,
                photos: projectStillPhotos,
                description: projectDescription,
                active: projectActive ? "active" : "historic",
                color: projectActive
                  ? "hsla(27.5, 86.3%, 51.4%, .3)"
                  : "hsla(190.4, 43.9%, 30.8%, .3)", // for polygon styling
                outline: projectActive
                  ? "hsla(27.5, 86.3%, 51.4%, .6)"
                  : "hsla(190.4, 43.9%, 30.8%, .6)", // for polygon styling
                banner: projectBanner,
                milestones: projectMilestones,
                events: projectEvents
              },
            });
          }
        });
        //add features/geojson to the map this will be the bulk of the front end work on this project
      });
    (Map.map.getSource("projectPointsSource") as GeoJSONSource).setData({
      type: "FeatureCollection",
      features: projectPoints,
    });
    /*(Map.map.getSource("projectAreaSource") as GeoJSONSource).setData({
      type: "FeatureCollection",
      features: projectPolys,
    });*/
  };

  async componentDidMount() {
    this.initializeMap();
  }

  private getIconImage = (category: string): IIconImageActiveHistoric => {
    switch (category) {
      case "Restoration":
        return {
          active: "StatusActiveTypeRestoration",
          historic: "StatusHistoricTypeRestoration",
        };
      case "Habitat Protection":
        return {
          active: "StatusActiveTypeHabitat",
          historic: "StatusHistoricTypeHabitat",
        };
      case "Mammal":
        return {
          active: "StatusActiveTypeMammal",
          historic: "StatusHistoricTypeMammal",
        };
      case "Fish/Amphibian":
        return {
          active: "StatusActiveTypeFishAmphibian",
          historic: "StatusHistoricTypeFishAmphibian",
        };
      case "Avian":
        return {
          active: "StatusActiveTypeAvian",
          historic: "StatusHistoricTypeAvian",
        };
      default:
        return {
          active: "StatusActiveTypeMammal",
          historic: "StatusActiveTypeMammal",
        };
    }
  };

  async componentDidUpdate(prevProps: Props, prevState: State) {
    // When map has loaded and active layers change, update layer visibility
    let aux = [];
    if (this.props.category.length==0) {
      this.updateProjects([]);
    } else {
      this.updateProjects(this.props.filteredEntries);
      Map.popup.remove();
    }

    if (
      this.state.mapLoaded &&
      prevProps.historicVsActive !== this.props.historicVsActive
    ) {
      if (this.props.historicVsActive === 1) {
        Map.map.setFilter("projectPoints", [
          "==",
          ["get", "active"],
          "historic",
        ]);
        Map.map.setFilter("projectArea", ["==", ["get", "active"], "historic"]);
      } else if (this.props.historicVsActive === 2) {
        Map.map.setFilter("projectPoints", null);
        Map.map.setFilter("projectArea", null);
      } else if (this.props.historicVsActive === 3) {
        Map.map.setFilter("projectPoints", ["==", ["get", "active"], "active"]);
        Map.map.setFilter("projectArea", ["==", ["get", "active"], "active"]);
      }
      Map.popup.remove();
    }
  }

  componentWillUnmount() {
    Map.map.remove();
  }

  render() {
    return (
      <>
        {
          <LayersModal showModal={this.state.shownModal} 
                      onClose={this.closeModal} 
                      onHandleLayerVisibilityChange={this.handleLayerVisibilityChange}
          />
        }
        
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            right: "5px",
            justifyContent: "end",
            top: "10px",
            position: "absolute"
          }}
        >
         
            <div id="geocoder" className="GeoCoder"></div>
            <div className="MenuDrawer">
              <CustomMenuDrawer 
                  showDesktop={true} 
              />
            </div>
          </div>
          <IconButton
            id ={'IconLayers'}
            className={'layersButton'}
            onClick={(e)=>{
              this.showModal(e)
            }}
          >
                <img
                    id = 'imageLayer'
                    src='/layers.svg'
                />
              
          </IconButton>
        

        <div className="owf-map">
          <div id="mapId" className="owf-map__container" />
        </div>
      </>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  selectedProject: state.app.selectedProject,
  selectedDetailPageProps: state.app.selectedDetailPageProps,
});

const mapDispatchToProps = (dispatch: any) => ({
  setSelectedProject: bindActionCreators(setSelectedProject, dispatch),
  setSelectedDetailPageProps: bindActionCreators(
    setSelectedDetailPageProps,
    dispatch
  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(Map);