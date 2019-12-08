module Main where

import System.IO
import Control.Monad
import Day1
import Day2
import Day3
import System.Environment (getArgs)

main :: IO ()
main = do
  args <- getArgs
  let day = head args
  handle <- openFile ("input/day" ++ day ++ ".txt") ReadMode
  contents <- hGetContents handle
  run (read day) contents
  
run :: Int -> String -> IO ()
run day contents 
  | day == 1 = do 
    Day1.run1 contents
    Day1.run2 contents
  | day == 2 = do
    Day2.run1 contents
    Day2.run2 contents
  | day == 3 = do
    Day3.run1 contents
    Day3.run2 contents
