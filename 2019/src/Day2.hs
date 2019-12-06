module Day2
    ( run1,
      run2
    ) where

import Control.Monad

run1 :: String -> IO ()
run1 input = putStrLn (show list ++ "\n" ++ show (run 0 list))
  where
    list = set (set (map read (split input)) 1 12) 2 2

run2 :: String -> IO ()
run2 input = print "Not done"

run :: Int -> [Int] -> [Int]
run offset list = case res of
  Nothing -> list
  Just (offset, list) -> run offset list
  where
    res = exec offset list

exec :: Int -> [Int] -> Maybe (Int, [Int])
exec offset list
  | op == 1 = Just (offset + 4, triplet (+) (offset + 1) list)
  | op == 2 = Just (offset + 4, triplet (*) (offset + 1) list)
  | op == 99 = Nothing
  | otherwise = Prelude.fail ("Invalid opcode: " ++ show op)
  where
    op = list !! offset

triplet :: (Int -> Int -> Int) -> Int -> [Int] -> [Int]
triplet f offset list = set list dest (arg1 `f` arg2)
  where
    index1 = list !! offset
    index2 = list !! (offset + 1)
    arg1 = list !! index1
    arg2 = list !! index2
    dest = list !! (offset + 2)

set :: [Int] -> Int -> Int -> [Int]
set list offset val = start ++ val : end
  where
    (start, _:end) = splitAt offset list

split :: String -> [String]
split [] = [""]
split (c:cs)
  | c == ','  = "" : rest
  | otherwise = (c : head rest) : tail rest
  where
    rest = split cs