import asyncio
import logging
from aiogram import Bot, Dispatcher, types
from aiogram.enums import ParseMode
from aiogram.filters import Command
from aiogram.types import WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.client.default import DefaultBotProperties

API_TOKEN = "7043247167:AAG3JBozpletL8E33Jl4tVLJ33pSyM3um1M"

# Включаем логирование
logging.basicConfig(level=logging.INFO)

# Инициализируем диспетчер
dp = Dispatcher()

@dp.message(Command("start"))
async def start_handler(message: types.Message):
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text="🎮 Играть в Zombie City",
            web_app=WebAppInfo(url="https://26a2-178-88-75-244.ngrok-free.app")
        )]
    ])
    await message.answer("Добро пожаловать в Zombie City!", reply_markup=keyboard)

async def main():
    # Бот без явного session — aiogram сам создаст его с нужными параметрами
    bot = Bot(
        token=API_TOKEN,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML)
    )
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
