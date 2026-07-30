<script setup lang="ts">
  import { siteConfig } from '~/data/site'
</script>

<template>
  <section id="about" class="about">
    <div class="about__container">
      <h2 class="about__title">Sobre o projeto</h2>
      <p class="about__text">
        O {{ siteConfig.name }} nasceu da necessidade de ter uma ferramenta simples e completa para
        gerenciar cultos adventistas. Reunindo Bíblia, liturgia, hinário, cronômetro e projeção em
        uma única plataforma web, facilitamos o trabalho de quem coordena os cultos e reduzimos a
        dependência de papel e ferramentas fragmentadas.
      </p>
      <p class="about__text">
        Desenvolvido com tecnologia moderna, o sistema roda diretamente no navegador sem necessidade
        de instalação. Acesso de qualquer dispositivo, em qualquer lugar.
      </p>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .about {
    padding: 5rem 1.5rem;
    background: #f5f5f5;

    &__container {
      max-width: 800px;
      margin: 0 auto;
    }

    &__title {
      text-align: center;
      font-size: 2.5rem;
      font-weight: 700;
      color: #1a237e;
      margin-bottom: 2rem;
    }

    &__text {
      font-size: 1.1rem;
      color: #424242;
      line-height: 1.8;
      margin-bottom: 1.5rem;
    }

    @media (max-width: 768px) {
      &__title {
        font-size: 2rem;
      }
      &__text {
        font-size: 1rem;
      }
    }
  }
</style>
