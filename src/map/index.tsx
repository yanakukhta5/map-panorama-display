import { useEffect, useState } from "react";

import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import Feature from "ol/Feature";
import { Pixel } from "ol/pixel";
import { fromLonLat } from "ol/proj";
import { Style, Fill, Stroke, Circle as CircleStyle } from "ol/style";

import semaphores from "./geojson/semaphores.json";
import line from "./geojson/line.json";
import roadCross from "./geojson/road_cross.json";

import { Drawer } from "./drawer";
import { Modal } from "./modal";

type TCurrentObject = Record<"country" | "name", string> | undefined;

export const MapComponent = () => {
  const [currentObject, setCurrentObject] = useState<TCurrentObject>();
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const OSMLayer = new TileLayer({
      source: new OSM(),
    });

    const roadCrossSource = new VectorSource({
      features: new GeoJSON().readFeatures(roadCross, {
        featureProjection: "EPSG:3857",
      }),
    });

    const roadCrossLayer = new VectorLayer({
      source: roadCrossSource,
    });

    const semaphoresSource = new VectorSource({
      features: new GeoJSON().readFeatures(semaphores, {
        featureProjection: "EPSG:3857",
      }),
    });

    const semaphoresLayer = new VectorLayer({
      source: semaphoresSource,
    });

    const lineSource = new VectorSource({
      features: new GeoJSON().readFeatures(line, {
        featureProjection: "EPSG:3857",
      }),
    });

    const lineLayer = new VectorLayer({
      source: lineSource,
    });

    const defaultStroke = new Stroke({
      color: "#8477e9",
      width: 3,
    });

    const defaultStyles = {
      Point: new Style({
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({
            color: "#88b1cb",
          }),
          stroke: defaultStroke,
        }),
      }),
      LineString: new Style({ stroke: defaultStroke }),
      Polygon: new Style({ stroke: defaultStroke }),
    };

    const highlightStroke = new Stroke({
      color: "#2be634",
      width: 3,
    });

    const highlightStyles = {
      Point: new Style({
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({
            color: "#74e485",
          }),
          stroke: highlightStroke,
        }),
      }),
      LineString: new Style({ stroke: highlightStroke }),
      Polygon: new Style({ stroke: highlightStroke }),
    };

    semaphoresSource.getFeatures().forEach((feature) => {
      feature.setStyle(defaultStyles.Point);
    });

    roadCrossSource.getFeatures().forEach((feature) => {
      feature.setStyle(defaultStyles.Polygon);
    });

    lineSource.getFeatures().forEach((feature) => {
      feature.setStyle(defaultStyles.LineString);
    });

    const info = document.getElementById("info") as HTMLDivElement;

    let currentFeature: Feature;
    const displayFeatureInfo = function (pixel: Pixel, target: HTMLElement) {
      const feature = target.closest(".ol-control")
        ? undefined
        : map.forEachFeatureAtPixel(pixel, function (feature) {
            return feature;
          });

      if (feature !== currentFeature) {
        const featureType = feature
          ?.getGeometry()
          ?.getType() as keyof typeof defaultStyles;

        const currentFeatureType = currentFeature
          ?.getGeometry()
          ?.getType() as keyof typeof defaultStyles;

        if (currentFeature)
          currentFeature.setStyle(defaultStyles[currentFeatureType]);

        if (feature) {
          info.style.left = pixel[0] + "px";
          info.style.top = pixel[1] + "px";
          info.style.visibility = "visible";
          const cords = feature.get("coordinates");
          const featureName = feature.get("name");
          if (featureType === "Point") {
            info.innerText = `${featureName} \n Долгота: ${cords[0]} \n Широта: ${cords[1]}`;
          }
          if (featureType === "LineString") {
            info.innerText = `Дорога ${featureName}`;
          }
          if (featureType === "Polygon") {
            info.innerText = `Область ${featureName}`;
          }
          (feature as Feature).setStyle(highlightStyles[featureType]);
        } else {
          info.style.visibility = "hidden";
        }
        currentFeature = feature as Feature;
      }
    };

    const map = new Map({
      target: "map",
      view: new View({
        center: fromLonLat([39.0312, 45.0355]),
        zoom: 14,
      }),
      layers: [OSMLayer, semaphoresLayer, lineLayer, roadCrossLayer],
    });

    map.on("pointermove", function (evt) {
      if (evt.dragging) {
        info.style.visibility = "hidden";
        return;
      }
      const pixel = map.getEventPixel(evt.originalEvent);
      displayFeatureInfo(pixel, evt.originalEvent.target);
    });

    map.on("singleclick", function (e) {
      map.forEachFeatureAtPixel(e.pixel, (feature) => {
        setCurrentObject(feature.getProperties() as TCurrentObject);
        setDrawerOpen(true);
      });
    });

    map.on("dblclick", function (e) {
      e.stopPropagation();
      map.forEachFeatureAtPixel(e.pixel, function (feature) {
        setCurrentObject(feature.getProperties() as TCurrentObject);
        setModalOpen(true);
      });
    });

    return () => map.setTarget(undefined);
  }, []);

  return (
    <div id="map" style={{ width: "100vw", height: "100vh" }}>
      <div id="info" />

      <Drawer
        open={Boolean(currentObject) && drawerOpen}
        onClose={() => setDrawerOpen(false)}
        country={currentObject?.country}
        name={currentObject?.name}
      />

      <Modal
        open={Boolean(currentObject) && modalOpen}
        onClose={() => setModalOpen(false)}
        name={currentObject?.name}
      />
    </div>
  );
};
