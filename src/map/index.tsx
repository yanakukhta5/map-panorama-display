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

import data from "../countries.json";
import { Style, Fill, Stroke, Circle as CircleStyle } from "ol/style";

import { Drawer } from "./drawer";
import { Modal } from "./modal";

type TCurrentObject = Record<"country" | "name", string> | undefined;

export const MapComponent = () => {
  const [currentObject, setCurrentObject] = useState<TCurrentObject>();
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [, setModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const vectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(data, {
        featureProjection: "EPSG:3857",
      }),
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    const defaultStyle = new Style({
      image: new CircleStyle({
        radius: 5,
        fill: new Fill({
          color: "#88b1cb",
        }),
        stroke: new Stroke({
          color: "#8477e9",
          width: 1,
        }),
      }),
    });

    const highlightStyle = new Style({
      image: new CircleStyle({
        radius: 5,
        fill: new Fill({
          color: "#74e485",
        }),
        stroke: new Stroke({
          color: "#2be634",
          width: 1,
        }),
      }),
    });

    vectorSource.getFeatures().forEach((feature) => {
      feature.setStyle(defaultStyle);
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
        if (currentFeature) {
          currentFeature.setStyle(defaultStyle);
        }
        if (feature) {
          info.style.left = pixel[0] + "px";
          info.style.top = pixel[1] + "px";
          info.style.visibility = "visible";
          const cords = feature.get("coordinates");
          info.innerText = `${feature.get("name")} \n Долгота: ${
            cords[0]
          } \n Широта: ${cords[1]}`;
          (feature as Feature).setStyle(highlightStyle);
        } else {
          info.style.visibility = "hidden";
        }
        currentFeature = feature as Feature;
      }
    };

    const map = new Map({
      target: "map",
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
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
        onClose={() => {
          setCurrentObject(undefined);
          setDrawerOpen(false);
        }}
        country={currentObject?.country}
        name={currentObject?.name}
      />

      <Modal
        open={Boolean(currentObject) || true}
        onClose={() => {
          setCurrentObject(undefined);
          setModalOpen(false);
        }}
        name={currentObject?.name}
      />
    </div>
  );
};
