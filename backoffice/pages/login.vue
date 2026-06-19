<template>
  <div class="login-page">
    <div class="card">
      <h2>Connexion Backoffice</h2>
      <form @submit.prevent="submit">
        <label>Email</label>
        <input v-model="email" type="email" required />

        <label>Mot de passe</label>
        <input v-model="password" type="password" required />

        <button type="submit">Se connecter</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

const email = ref('')
const password = ref('')
const router = useRouter()
const auth = useAuthStore()

async function submit(){
  try{
    await auth.login({email: email.value, password: password.value})
    router.push('/dashboard')
  }catch(e){
    alert('Erreur de connexion')
  }
}
</script>

<style scoped>
.login-page{display:flex;align-items:center;justify-content:center;height:80vh}
.card{width:380px;padding:24px;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,0.08)}
label{display:block;margin-top:12px}
input{width:100%;padding:8px;margin-top:6px}
button{margin-top:14px;padding:10px 14px}
</style>
