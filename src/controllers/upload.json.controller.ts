import { Request, Response } from "express";
import { GenericObject, transformArray } from "../helpers/transform.keys";
import { publishAds } from "../patterns/strategy/ContextStrategy"

export const uploadJsonController = async (req: Request, res: Response) => {
  const managerId: string = req.params.managerId;

  if (!managerId || managerId === 'undefined') {
    return res.send({ message: "Не передан managerId в параметры запроса", result: false });
  }

  try {
    const { jsonObject, feedName }: { jsonObject: string, feedName: string } = req.body;
    let listAds: GenericObject[];

    try {
      listAds = JSON.parse(jsonObject);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return res.status(400).json({ error: 'Invalid JSON format' });
    }

    const transformedArr: GenericObject[] = transformArray(listAds);

    try {
      await publishAds(transformedArr, false, managerId, feedName);
    } catch (error) {
      console.error('Error publishing ads:', error);
      return res.status(500).json({ error: 'Failed to publish ads' });
    }

    res.json({ message: 'JSON received successfully', data: transformedArr });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};