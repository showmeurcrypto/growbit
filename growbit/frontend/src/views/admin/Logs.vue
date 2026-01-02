<template>
  <div>
    <div v-if="selectedFile">
      <div>
        <div class="top_row">
          <button class="goBack" @click="selectedFile = null">
            <img src="@/assets/images/arrow_left.svg" />
          </button>

          <label>
            Search:
            <input type="text" v-model="searchTerm" />
          </label>
          <label>
            Limit:
            <input type="number" v-model.number="limit" />
          </label>
          <button class="fetch" @click="fetchLogs">Fetch Logs</button>
        </div>

        <div>
          <p v-if="loading">Loading logs...</p>
          <div class="logs">
            <div v-for="(log, index) in logs" :key="index">
              {{ log }}
            </div>
          </div>

          <p v-if="!logs.length && !loading">No logs available</p>
        </div>
      </div>
    </div>

    <div v-else>
      <h2>Available Log Files</h2>
      <p v-if="loading">Loading files...</p>
      <ul v-if="!loading" class="logList">
        <li v-for="file in files" :key="file.name">
          <button
            @click="selectedFile = file.name"
            :style="{ color: file.type === 'error' ? 'red' : 'white' }"
          >
            {{ file.name }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import axios from "axios";

export default {
  setup() {
    const files = ref([]);
    const logs = ref([]);
    const selectedFile = ref(null);
    const searchTerm = ref("");
    const limit = ref(50);
    const loading = ref(false);

    const fetchLogFiles = async () => {
      try {
        loading.value = true;
        const res = await axios.get("/admin/logs", {});
        const data = res.data;
        files.value = data.files;
      } catch (err) {
      } finally {
        loading.value = false;
      }
    };

    const fetchLogs = async () => {
      if (!selectedFile.value) return;
      try {
        loading.value = true;
        const res = await axios.get(
          `/admin/logs/read?fileName=${selectedFile.value}&limit=${limit.value}&search=${searchTerm.value}`,
          {}
        );
        const data = res.data;

        const prettyLogs = data.logs.map((log) => {
          try {
            let parsed = JSON.parse(log);
            delete parsed.level;
            let formatted = "";

            for (let key in parsed) {
              let line = parsed[key].trim();
              formatted += parsed[key] + "\n";
            }

            return formatted;
          } catch (e) {
            return log; // Keep raw log if not valid JSON
          }
        });

        logs.value = prettyLogs;
      } catch (err) {
        //error.value = "Error fetching log data: " + err.message;
      } finally {
        loading.value = false;
      }
    };

    watch(selectedFile, () => {
      fetchLogs();
    });

    onMounted(fetchLogFiles);

    return {
      files,
      logs,
      selectedFile,
      searchTerm,
      limit,
      loading,
      fetchLogs,
    };
  },
};
</script>

<style scoped lang="scss">
.logs {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 20px;

  > div {
    white-space: pre;
    border-bottom: 2px solid #22224a;
  }
}

.top_row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-direction: row;
}

input {
  background: #22224a;
  height: 40px;
  padding-left: 5px;
}

button.fetch {
  padding: 12px 10px;
  background-color: var(--green);
  color: black;
  border-radius: 4px;
}

ul {
  list-style: none;
  margin-top: 15px;
}
ul.logList > li button {
  color: white;
  width: 100%;
  margin-bottom: 10px;
  text-align: left;
  padding: 12px 10px;
  cursor: pointer;
  background: #22224a;
  border-radius: 4px;
}

.goBack {
  width: fit-content;
  background: #22224a;
  border-radius: 4px;

  padding: 15px;
}
</style>
