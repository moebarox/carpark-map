<script setup lang="ts">
  import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet';
  import { ref, onMounted } from 'vue';
  import csv from 'csvtojson';
  import proj4 from 'proj4';
  import axios from 'axios';
  import 'leaflet/dist/leaflet.css';

  import type { TCarpark, TAvailability, TCoordinate } from '../types/carpark';

  proj4.defs('EPSG:3414', '+proj=tmerc +lat_0=1.36666666666667 +lon_0=103.833333333333 +k=1 +x_0=28001.642 +y_0=38744.572 +ellps=WGS84 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs')
  
  const isInitiated = ref<boolean>(false)
  const carparkData = ref<TCarpark[]>([])
  const zoom = ref<number>(11)
  const bounds = ref()
  const center = ref<[number, number]>([1.3010633, 103.854118])

  const fetchCarpark = async (): Promise<TCarpark[]> => {
    try {
      const { data } = await axios.get('/HDBCarparkInformation.csv', { responseType: 'blob' })
      const csvText = await data.text()
      return await csv().fromString(csvText)
    } catch (err) {
      console.error(err)
      return []
    }
  }

  const fetchAvailability = async (): Promise<TAvailability[]> => {
    try {
      const { data } = await axios.get('https://api.data.gov.sg/v1/transport/carpark-availability')
      return data?.items?.[0]?.carpark_data || []
    } catch (err) {
      console.error(err)
      return []
    }
  }

  const initCarparkData = (carparks: TCarpark[], availabilities: TAvailability[]) => {
    carparkData.value = carparks.map(carpark => {
      return {
        ...carpark,
        coordinate: convertCoordinate([
          Number(carpark.x_coord),
          Number(carpark.y_coord),
        ]),
        availabilities: availabilities.find(item => {
          return item.carpark_number === carpark.car_park_no
        }),
      }
    })
  }

  const convertCoordinate = (coordinate: TCoordinate): TCoordinate => {
    const firstProjection = 'EPSG:3414'
    const secondProjection = 'EPSG:4326'
    const [lng, lat] = proj4(firstProjection, secondProjection, coordinate)
    return [lat, lng]
  }

  onMounted(() => {
    Promise.all([fetchCarpark(), fetchAvailability()])
      .then(([carparks, availabilities]) => {
        initCarparkData(carparks, availabilities)
        isInitiated.value = true
      });
  })
</script>

<template>
  <div style="height:600px; width:800px">
    <l-map
      ref="map"
      v-model:zoom="zoom"
      :center="center"
      :use-global-leaflet="false"
      @update:bounds="bounds = $event"
    >
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
      />

      <template v-if="isInitiated">
        <l-marker
          v-for="carpark in carparkData"
          :key="carpark.car_park_no"
          :lat-lng="carpark.coordinate"
        >
          <l-popup>
            <h4>{{ carpark.car_park_no }}</h4>
            <div>{{ carpark.address }}</div>
            <div v-for="info in carpark.availabilities?.carpark_info" :key="info.lot_type">
              <div>{{ info.lot_type }}: {{ info.lots_available }} / {{ info.total_lots }}</div>
            </div>
          </l-popup>
        </l-marker>
      </template>
    </l-map>
  </div>
</template>

<style scoped>
</style>
