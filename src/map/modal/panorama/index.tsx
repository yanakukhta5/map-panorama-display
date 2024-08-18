import ReactPannellum from 'react-pannellum'

export const Panorama = () => {
  return (
    <ReactPannellum
      id="1"
      sceneId="firstScene"
      imageSource="/panorams/pano.jpg"
      config={{
        autoRotate: -2,
        autoLoad: true,
        title: 'Панорама',
        description: 'Описание этой панорамы',
      }}
    />
  )
}
